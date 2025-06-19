import Logger from './Logger'
import {
  DEVICE_DESKTHING,
  DeviceToDeskthingData,
  DESKTHING_DEVICE,
  DeskThingToDeviceCore
} from '@deskthing/types'

type SocketEventListener = (msg: DeskThingToDeviceCore & { app?: string }) => void
type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting'
type StatusListener = (status: ConnectionStatus) => void

/**
 * Manages the WebSocket connection and provides methods for sending and receiving messages.
 * This class is a singleton, and can be accessed using the `getInstance()` method.
 */
export class WebSocketManager {
  private socket: WebSocket | null = null
  private listeners: SocketEventListener[] = []
  private statusListeners: StatusListener[] = []
  private reconnecting = false
  private _url: string
  public get url() {
    return this._url
  }
  private set url(value: string) {
    this._url = value
  }
  private heartbeatInterval: NodeJS.Timeout | null = null
  private pongTimeout: NodeJS.Timeout | null = null
  private missedPongs = 0
  private readonly MAX_MISSED_PONGS = 3
  private clientId: string | null = null
  private code = Math.random() * 1000000

  private closeTimeoutId: NodeJS.Timeout | null = null
  private reconnectId: NodeJS.Timeout | null = null

  private messageQueue: DeviceToDeskthingData[] = []

  constructor(clientId: string, url?: string) {
    this.clientId = clientId
    this.url = url || this.url
    console.debug('WebSocketManager initialized with URL:', this.url)
  }

  getclientId() {
    return this.clientId
  }

  setId(id: string) {
    this.clientId = id
  }

  private processQueue = (): void => {
    console.debug('Initializing process queue')
    if (this.messageQueue.length <= 0) return // cancel processing if there is no queue
    
    if (!this.socket) {
      console.debug('Socket undefined')
      return // cancel processing if the socket is undefined
    }
    
    if (this.socket.readyState !== WebSocket.OPEN) {
      console.debug(`Socket ${this.socket.readyState} is not open`)
      return // cancel processing if the socket is not open
    }

    const message = this.messageQueue.pop()

    if (!message) this.processQueue()

    console.debug('Processing queue item ', message.type)

    this.sendMessage(message)

    if (this.messageQueue.length > 0) this.processQueue()
  }

  async closeExisting() {
    if (this.socket) {
      // Clean up event listeners
      this.socket.onopen = null
      this.socket.onclose = null
      this.socket.onerror = null
      this.socket.onmessage = null

      // Close connection if open
      if (this.socket.readyState === WebSocket.OPEN) {
        await this.socket.close(4000, 'Closing existing connection')
      }

      // Clear heartbeat timers
      this.stopHeartbeat()

      // Reset state
      this.socket = null
      this.missedPongs = 0
    }
  }

  async connect(url?: string) {

    // Check if already connected

    if (this.url == url && this.socket.readyState == WebSocket.OPEN) {
      console.debug(`Socket at location ${this.url} is already open and working.`)
    }

    this.url = url || this.url

    const id = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')

    if (this.url == undefined || !this.url) {
      console.warn(`[${id}] No WebSocket URL provided`)
      return
    } else {
      console.debug(`[${id}] Connecting to WebSocket: ${this.url}`)
    }

    await this.closeExisting()

    console.log(`[${id}] Creating a new WebSocket instance on ${this.url}`)
    this.socket = new WebSocket(this.url)
    console.debug(`[${id}] Created new WebSocket instance`, this.socket.url)

    const connectionPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.socket.readyState === WebSocket.CONNECTING) {
          reject(new Error(`[${id}] Connection timeout`))
        } else {
          resolve()
        }
      }, 5000)

      this.socket!.onopen = () => {
        clearTimeout(timeout)
        console.info(`[${id}] Connected to ${this.url}`)
        resolve()
      }

      this.socket!.onerror = (error) => {
        clearTimeout(timeout)
        console.error(`[${id}] WebSocket error:`, error)
        reject(error)
      }
    })

    this.socket.onopen = () => {
      console.info(`[${id}] Connected to ${this.url}`)
      this.reconnecting = false
      this.startHeartbeat()
      this.notifyStatusChange('connected')
        this.processQueue() // start processing the queue
    }

    this.socket.onclose = (reason) => {
      console.warn(`[${id}] Disconnected, attempting to reconnect...`, this.code, reason)
      this.stopHeartbeat()
      this.notifyStatusChange('disconnected')

      if (this.closeTimeoutId) {
        clearTimeout(this.closeTimeoutId)
      }

      this.closeTimeoutId = setTimeout(() => {
        this.reconnect()
      }, 5000)
    }

    this.socket.onerror = (error) => {
      console.error(`[${id}] WebSocket error:`, error)
    }

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as DeskThingToDeviceCore & { app: string }
      if (data.app == 'client') {
        if (data.type == DESKTHING_DEVICE.PONG) {
          if (data.payload) {
            // Update the clientId with the one from the ping
            this.setId(data.payload)
          }
          this.resetPongTimeout()
        } else if (data.type == DESKTHING_DEVICE.PING) {
          if (data.payload) {
            // Update the clientId with the one from the ping
            this.setId(data.payload)
          }
          this.sendMessage({ app: 'server', type: DEVICE_DESKTHING.PONG })
        }
      }

      this.notifyListeners(data)
    }

    try {
      // Wait for the connection to be established
      await connectionPromise
      return true
    } catch (error) {
      console.error(`[${id}] Failed to establish connection:`, error)
      if (this.closeTimeoutId) {
        clearTimeout(this.closeTimeoutId)
      }

      this.closeTimeoutId = setTimeout(() => {
        this.reconnect()
      }, 5000)
      return false
    }
  }

  disconnect() {
    this.closeExisting()
  }

  reconnect() {
    Logger.info('Reconnecting in 10s...')
    if (this.reconnecting) return
    this.reconnecting = true
    this.notifyStatusChange('reconnecting')

    this.disconnect()

    if (this.reconnectId) {
      clearTimeout(this.reconnectId)
    }

    this.reconnectId = setTimeout(() => {
      Logger.info('Conecting...')
      this.connect()
      this.reconnecting = false
    }, 10000) // Reconnect after 10 seconds
  }

  sendMessage(message: DeviceToDeskthingData, important = true) {
    if (!this.socket) {
      console.error('Socket is not initialized')
      console.debug(`Failed to send ${message.type}`)
      if (important) {
        console.debug('Adding to queue for sending later')
        this.messageQueue.push(message)
      }
      return
    }
    
    if (this.socket.readyState !== WebSocket.OPEN) {
      console.error('Socket is not open. The state is', this.socket.readyState)
      console.debug(`Failed to send ${message.type}`)
      if (important) {
        console.debug('Adding to queue for sending later')
        this.messageQueue.push(message)
      }
      return
    }

    const socketMessage = { ...message, clientId: this.clientId }
    console.debug(`[${message.app} ${message.type}]`, socketMessage)
    this.socket.send(JSON.stringify(socketMessage))
  }

  addListener(listener: SocketEventListener) {
    this.listeners.push(listener)
    return () => this.removeListener(listener)
  }

  removeListener(listener: SocketEventListener) {
    this.listeners = this.listeners.filter((l) => l !== listener)
  }

  addStatusListener(listener: StatusListener) {
    this.statusListeners.push(listener)
  }

  removeStatusListener(listener: StatusListener) {
    this.statusListeners = this.statusListeners.filter((l) => l !== listener)
  }

  private notifyStatusChange(status: ConnectionStatus) {
    this.statusListeners.forEach((listener) => listener(status))
  }

  private notifyListeners(data: DeskThingToDeviceCore & { app: string }) {
    this.listeners.forEach((listener) => listener(data))
  }

  private startHeartbeat() {
    this.stopHeartbeat() // Clear any existing heartbeat
    this.missedPongs = 0

    // Send "ping" every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.sendMessage({ app: 'server', type: DEVICE_DESKTHING.PING })
        this.startPongTimeout()
      }
    }, 30000)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout)
      this.pongTimeout = null
    }
  }

  private startPongTimeout() {
    // If "pong" isn't received within 10 seconds, increment missed pongs
    if (this.pongTimeout) clearTimeout(this.pongTimeout)
    this.pongTimeout = setTimeout(() => {
      this.missedPongs += 1
      console.warn(`Missed pong ${this.missedPongs}/${this.MAX_MISSED_PONGS}`)
      if (this.missedPongs >= this.MAX_MISSED_PONGS) {
        this.closeExisting()
        this.reconnect()
      }
    }, 10000)
  }

  private resetPongTimeout() {
    this.missedPongs = 0 // Reset missed pong count on successful pong
    if (this.pongTimeout) clearTimeout(this.pongTimeout)
  }
}
