
import { DEVICE_DESKTHING, Log, LOGGING_LEVELS } from '@deskthing/types'
import { useWebSocketStore, WebSocketState } from '@src/stores/websocketStore'

export class Logger {
  private static instance: Logger
  private webSocketStore: WebSocketState | undefined = undefined

  private constructor() {
    setTimeout(() => {
      this.webSocketStore = useWebSocketStore.getState()
      // Wait a bit before making the stores
    }, 100)
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatMessage(level: LOGGING_LEVELS, message: string, app?: string): Log {
    return {
      level,
      message,
      source: app || 'server',
      date: new Date().toISOString()
    }
  }

  public async log(type: LOGGING_LEVELS, app: string, payload: string, ...data: any[]) {
    const logEntry = this.formatMessage(type, payload, app)

    // Log to console
    switch (type) {
      case LOGGING_LEVELS.ERROR:
        console.error(`[${app} ${type}] ${payload}`, ...data)
        break
      case LOGGING_LEVELS.WARN:
        console.warn(`[${app} ${type}] ${payload}`, ...data)
        break
      case LOGGING_LEVELS.LOG:
        console.info(`[${app} ${type}] ${payload}`, ...data)
        break
      case LOGGING_LEVELS.DEBUG:
        console.debug(`[${app} ${type}] ${payload}`, ...data)
        break
      default:
        console.log(`[${app} ${type}] ${payload}`, ...data)
    }

    // Send to server
    try {
      await this.webSocketStore?.send({
        app: 'server',
        type: DEVICE_DESKTHING.LOG,
        payload: logEntry
      })
    } catch (error) {
      console.error('Failed to send log to server:', error)
    }
  }

  public async info(message: string, ...data: any[]) {
    await this.log(LOGGING_LEVELS.LOG, 'server', message, data)
  }

  public async warn(message: string, ...data: any[]) {
    await this.log(LOGGING_LEVELS.WARN, 'server', message, data)
  }

  public async error(message: string, ...data: any[]) {
    await this.log(LOGGING_LEVELS.ERROR, 'server', message, data)
  }

  public async debug(message: string, ...data: any[]) {
    await this.log(LOGGING_LEVELS.DEBUG, 'server', message, data)
  }
}

export default Logger.getInstance()
