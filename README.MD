# 📄 PDF Preview Boilerplate

A lightweight HTML demo for previewing, opening, and downloading a PDF inside mobile browsers and in-app webviews (iOS & Android).

> [!IMPORTANT]
> **Bring your own PDF files.**
> This demo does not ship with production documents — please provide your own PDF.
> The layout is currently designed for **A4 format** PDFs; other page sizes may not display as intended.
>
> To use your file, either name it `test_notice.pdf` and place it in the project root (replacing the sample), or update the four references to `test_notice.pdf` in [test-pdf-boilerplate.html](test-pdf-boilerplate.html) (the `<object data>`, the fallback link, the Download button, and the `PDF_PATH` constant).

---

## 📚 Table of Contents

1. [Project Structure](#-project-structure)
2. [Run Locally with Live Server](#-1-run-locally-with-live-server)
3. [Run on Emulators / Simulators](#-2-run-on-emulators--simulators)
4. [Run on a Physical Device via USB](#-3-run-on-a-physical-device-via-usb)
5. [Online Hosting with Cloudflare Tunnel](#-4-online-hosting-with-cloudflare-tunnel)
6. [Quick Reference](#-quick-reference)
7. [Troubleshooting](#-troubleshooting)

---

## 🗂 Project Structure

```
Boilerplates/
├── README.MD
├── test-pdf-boilerplate.html   # The demo page
└── test_notice.pdf             # Sample PDF (replace with your own, A4)
```

---

## 🚀 1. Run Locally with Live Server

### Install

1. Open **VS Code** → **Extensions** (`Ctrl+Shift+X` / `Cmd+Shift+X`).
2. Search for **Live Server** (by Ritwick Dey) and click **Install**.

### Port

Live Server runs on its default port, **`5500`**, and every URL and command in this guide uses it. You don't need to configure anything.

> 💡 Need a different port? Add `"liveServer.settings.port": <PORT>` to `.vscode/settings.json` in the project root, then replace `5500` everywhere below.

### Start the server

- Right-click `test-pdf-boilerplate.html` → **Open with Live Server**, **or**
- Click **Go Live** in the VS Code status bar (bottom-right).

Your browser opens at:

```
http://127.0.0.1:5500/test-pdf-boilerplate.html
```

> 🧰 **No VS Code?** Any static server works, e.g. `python -m http.server 5500` from the project folder.

---

## 📱 2. Run on Emulators / Simulators

Keep Live Server running, then open the matching URL inside the emulator's browser.

| Platform | Tool | URL |
|---|---|---|
| 🍎 **iOS Simulator** | Xcode | `http://localhost:5500/test-pdf-boilerplate.html` |
| 🤖 **Android Emulator** | Android Studio | `http://10.0.2.2:5500/test-pdf-boilerplate.html` |

### 🍎 iOS Simulator (Xcode — macOS only)

1. Install **Xcode** from the Mac App Store.
2. Open Xcode → **Xcode ▸ Open Developer Tool ▸ Simulator**.
3. Pick a device via **File ▸ Open Simulator**.
4. Open **Safari** in the simulator and go to `http://localhost:5500/test-pdf-boilerplate.html`.

> The iOS Simulator shares your Mac's network, so `localhost` works directly.

### 🤖 Android Emulator (Android Studio)

1. Install **Android Studio**.
2. Open **Device Manager** → create or start a virtual device.
3. Open **Chrome** in the emulator and go to `http://10.0.2.2:5500/test-pdf-boilerplate.html`.

> `10.0.2.2` is the emulator's special alias for your computer's `localhost`.
> Want to use `localhost` instead? Run `adb reverse tcp:5500 tcp:5500` (see below).

---

## 🔌 3. Run on a Physical Device via USB

### 🤖 Android — ADB Reverse Tunnel

ADB comes with Android Studio (**SDK Platform-Tools**). Make sure `adb` is on your `PATH`.

**Phone setup (one-time):**

1. **Settings ▸ About phone** → tap **Build number** 7 times to unlock Developer Options.
2. **Settings ▸ Developer options** → enable **USB debugging**.
3. Connect via USB and accept the **"Allow USB debugging?"** prompt on the phone.

**Create the tunnel:**

```bash
# 1. Detect the connected phone
adb devices

# 2. Forward the phone's port 5500 to your computer's port 5500 over USB
adb reverse tcp:5500 tcp:5500

# 3. (Optional) Confirm which tunnels are active
adb reverse --list
```

Now open Chrome on the phone and visit:

```
http://localhost:5500/test-pdf-boilerplate.html
```

**Multiple devices connected?** Target one by its ID (from `adb devices`):

```bash
adb -s <DEVICE_ID> reverse tcp:5500 tcp:5500
```

**Cleanup:**

```bash
adb reverse --remove tcp:5500     # remove one tunnel
adb reverse --remove-all          # remove all tunnels
```

### 🍎 iOS — USB Connection

iOS has no `adb reverse` equivalent, so a USB cable alone can't route `localhost` to your computer. Use one of these:

**Option A — Same Wi-Fi network**

1. Let Live Server accept LAN connections by adding this to `.vscode/settings.json`:
   ```json
   {
     "liveServer.settings.host": "0.0.0.0"
   }
   ```
2. Find your computer's local IP:
   - **macOS:** `ipconfig getifaddr en0`
   - **Windows:** `ipconfig` → look for *IPv4 Address*
3. On the iPhone (same Wi-Fi), open Safari: `http://<YOUR_LOCAL_IP>:5500/test-pdf-boilerplate.html`

> Allow the connection if your firewall prompts you.

**Option B — Cloudflare Tunnel**

Works from any network and gives you HTTPS. See [section 4](#-4-online-hosting-with-cloudflare-tunnel).

**Debugging over USB (Safari Web Inspector — macOS):**

1. iPhone: **Settings ▸ Apps ▸ Safari ▸ Advanced** → enable **Web Inspector**.
2. Mac: **Safari ▸ Settings ▸ Advanced** → enable **Show features for web developers**.
3. Connect the iPhone via USB, open the page on the phone, then on the Mac choose **Develop ▸ [Your iPhone] ▸ [Page]**.

---

## 🌐 4. Online Hosting with Cloudflare Tunnel

Use this when you need a **public HTTPS URL** — e.g. testing inside in-app browsers (Messenger, Instagram, Slack, etc.), sharing with teammates, or testing iOS devices without Wi-Fi setup.

### Install `cloudflared`

| OS | Command |
|---|---|
| **macOS** | `brew install cloudflared` |
| **Windows** | `winget install --id Cloudflare.cloudflared` |
| **Linux** | See [Cloudflare's downloads page](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) |

### Start the tunnel

With Live Server running on port `5500`:

```bash
cloudflared tunnel --url http://localhost:5500
```

Look for a line like this in the output:

```
Your quick Tunnel has been created! Visit it at:
https://random-words-here.trycloudflare.com
```

Copy the URL and append the page path:

```
https://random-words-here.trycloudflare.com/test-pdf-boilerplate.html
```

Open that on any device, on any network. Press `Ctrl+C` to stop the tunnel.

> [!WARNING]
> - Quick tunnels are **temporary** — you get a new URL each time you run the command.
> - **Anyone with the link can access the page** while the tunnel is running. Don't expose sensitive PDFs.
> - For a permanent URL on your own domain, set up a [named tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) with a Cloudflare account.

---

## ⚡ Quick Reference

| Scenario | URL |
|---|---|
| Desktop browser | `http://127.0.0.1:5500/test-pdf-boilerplate.html` |
| iOS Simulator | `http://localhost:5500/test-pdf-boilerplate.html` |
| Android Emulator | `http://10.0.2.2:5500/test-pdf-boilerplate.html` |
| Android phone (USB + `adb reverse`) | `http://localhost:5500/test-pdf-boilerplate.html` |
| iPhone (same Wi-Fi) | `http://<YOUR_LOCAL_IP>:5500/test-pdf-boilerplate.html` |
| Anywhere (Cloudflare) | `https://<random>.trycloudflare.com/test-pdf-boilerplate.html` |

| ADB Command | Purpose |
|---|---|
| `adb devices` | List connected devices |
| `adb reverse tcp:5500 tcp:5500` | Tunnel phone port → computer port |
| `adb -s <ID> reverse tcp:5500 tcp:5500` | Tunnel for a specific device |
| `adb reverse --list` | Show active tunnels |
| `adb reverse --remove-all` | Remove all tunnels |

---

## 🛠 Troubleshooting

| Problem | Fix |
|---|---|
| `adb devices` shows nothing / `unauthorized` | Re-plug the cable, accept the USB debugging prompt, try a data-capable cable. |
| `adb: command not found` | Add Android SDK `platform-tools` to your `PATH`. |
| Page loads but PDF is blank | Check the file name matches `test_notice.pdf` (or your updated path) and that the PDF is valid. |
| PDF looks cropped or scaled oddly | The layout targets **A4** — confirm your PDF's page size. |
| Live Server opened on a different port | Port `5500` was busy, so Live Server picked another. Free up `5500` or use the port shown in the VS Code status bar. |
| iPhone can't reach local IP | Confirm same Wi-Fi, `host` set to `0.0.0.0`, and firewall allows port `5500`. |
| Cloudflare URL returns 502 | Live Server isn't running, or it's on a different port than the tunnel. |
