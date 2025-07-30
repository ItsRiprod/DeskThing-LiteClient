# DeskThing LiteClient

Welcome to the next-gen DeskThing client. This is the experimental, lightweight alternative to the classic DeskThing Client you know and love.

---

## 🚀 Quick Install

**Method A: Add via Repository**

1. Make sure your DeskThing server is up to date.
2. Go to **Downloads** → **Clients**.
3. Click **Add Client** and paste:  
  `https://github.com/itsriprod/deskthing-liteclient`
4. Hit **Add Repository**. "LiteClient" should now appear under Downloads.
5. Click **Download Latest** to stage the client.
6. Go to **Clients → Connections** and hit **Push Staged** next to your device.  
  _Or_: Go to **Details → ADB** and hit **Push Staged** there.
7. Done. Enjoy.

**Method B: Manual ZIP Upload**

1. Head to the [Releases](https://github.com/itsriprod/deskthing-liteclient/releases) page.
2. Download the latest `.zip` of the client.
3. In DeskThing, go to **Downloads → Clients** and click **Add Client**.
4. Choose **Upload ZIP** and select your downloaded file.
5. Continue from Step 6 in Method A.

---

## 🛠️ Development

- Fork, branch, and PR your changes.  
  _Screenshots = bonus points._
- To get started:
  ```bash
  npm install
  npm run dev
  ```
  Open the URL from your terminal.

- DeskThing running? The client should work just like any other.

- For production testing:
  ```bash
  npm run build
  ```
  Then upload the `dist/` ZIP using Method B above.

---

**Questions?**  
Open an issue, PR, or contact me on discord at `riprod`. Happy hacking!