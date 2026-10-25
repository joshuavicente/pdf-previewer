# 📄 PDF Preview Boilerplate

A demo for previewing, opening, and downloading a PDF inside mobile browsers and in-app webviews (iOS & Android). It comes in two versions:

| Version | What it is | Preview | Port | Page path |
|---|---|---|---|---|
| **[plain/](plain/)** | A single HTML file, no build step | Browser's own PDF viewer (`<object>`) | `5500` (Live Server) | `/plain/test-pdf-boilerplate.html` |
| **[angular-16/](angular-16/)** | An Angular 16 app with one page per preview flow | Your choice: browser's own viewer (`<object>`) or [PDF.js](https://mozilla.github.io/pdf.js/) drawn onto `<canvas>` | `4200` (`ng serve`) | `/` (chooser), `/object`, `/pdfjs` |

Use the **plain** version to check what a browser does on its own, and the **Angular** version to compare the `<object>` and PDF.js flows side by side the way they will run in an Angular 16 app.

> [!IMPORTANT]
> **Bring your own PDF files.**
> This demo does not ship with production documents — please provide your own PDF.
> The layout is currently designed for **A4 format** PDFs; other page sizes may not display as intended.
> PDF files are git-ignored (`*.pdf`), so each person adds their own copy.
>
> - **Plain version:** name it `test_notice.pdf` and place it in `plain/`, or update the four references to `test_notice.pdf` in [plain/test-pdf-boilerplate.html](plain/test-pdf-boilerplate.html) (the `<object data>`, the fallback link, the Download button, and the `PDF_PATH` constant).
> - **Angular version:** place it in `angular-16/src/assets/` and update `PDF_SRC` in [app.routes.ts](angular-16/src/app/app.routes.ts). Both flows use it.

---

## 📚 Table of Contents

1. [Project Structure](#-project-structure)
2. [Prerequisites](#-prerequisites)
3. [Run Locally](#-1-run-locally)
4. [Run on Emulators / Simulators](#-2-run-on-emulators--simulators)
5. [Run on a Physical Device via USB](#-3-run-on-a-physical-device-via-usb)
6. [Online Hosting with Cloudflare Tunnel](#-4-online-hosting-with-cloudflare-tunnel)
7. [How the Angular Preview Works](#-5-how-the-angular-preview-works)
8. [Quick Reference](#-quick-reference)
9. [Troubleshooting](#-troubleshooting)

---

## 🗂 Project Structure

```
Boilerplates/
├── README.MD
├── plain/
│   ├── test-pdf-boilerplate.html          # The plain demo page
│   └── test_notice.pdf                    # Your PDF (A4)
└── angular-16/
    ├── package.json                       # npm scripts: start, start:tunnel, build
    ├── angular.json                       # Copies the PDF.js worker into assets/pdfjs
    └── src/
        ├── assets/test_notice.pdf         # Your PDF (A4)
        ├── styles.scss                    # Global styles (empty — each component styles itself)
        └── app/
            ├── app.routes.ts              # Routes + which PDF to show (PDF_SRC)
            ├── app.config.ts              # Router setup (route data → component inputs)
            ├── app.component.ts           # Just a <router-outlet>
            ├── pdf-preview/               # "/"        Links to choose a flow
            ├── pdf-object-viewer/         # "/object"  Browser's own viewer in an <object>
            └── pdfjs-viewer/              # "/pdfjs"   Pages drawn onto <canvas> by PDF.js
```

Each component folder has its own `.component.ts`, `.component.html` and `.component.scss`.

---

## 🧰 Prerequisites

| Tool | Needed for | Get it |
|---|---|---|
| **VS Code** + **Live Server** extension | Plain version | Extensions (`Ctrl+Shift+X`) → search **Live Server** (by Ritwick Dey) |
| **Node.js 16.14+ or 18.10+** | Angular version | [nodejs.org](https://nodejs.org/). Newer versions (e.g. 22) work but print an "unsupported" warning. |
| **Android Studio** | Android Emulator, `adb` | [developer.android.com/studio](https://developer.android.com/studio) |
| **Xcode** (macOS only) | iOS Simulator, Safari Web Inspector | Mac App Store |
| **cloudflared** | Public HTTPS URL | `winget install --id Cloudflare.cloudflared` (Windows) / `brew install cloudflared` (macOS) |

---

## 🚀 1. Run Locally

### Plain version — Live Server

1. Right-click `plain/test-pdf-boilerplate.html` → **Open with Live Server**, or click **Go Live** in the VS Code status bar.
2. Your browser opens at:
   ```
   http://127.0.0.1:5500/plain/test-pdf-boilerplate.html
   ```

Live Server uses its default port, `5500`. To change it, add `"liveServer.settings.port": <PORT>` to `.vscode/settings.json` in the project root.

> 🧰 **No VS Code?** Any static server works, e.g. `python -m http.server 5500` from the `Boilerplates` folder.

### Angular version — `ng serve`

```powershell
cd angular-16
npm install     # first time only
npm start       # runs "ng serve" with the project's own Angular 16 CLI
```

Open `http://localhost:4200/` and choose **Preview with &lt;object&gt;** or **Preview with PDF.js**. You can also go straight to `http://localhost:4200/object` or `http://localhost:4200/pdfjs`.

| npm script | Runs | Use it for |
|---|---|---|
| `npm start` | `ng serve` | Local and USB testing |
| `npm run start:tunnel` | `ng serve --disable-host-check` | Cloudflare Tunnel (see [section 4](#-4-online-hosting-with-cloudflare-tunnel)) |
| `npm run build` | `ng build` | Production build in `dist/angular-16/` |

> [!NOTE]
> **Windows / PowerShell users:**
> - If `npm` fails with *"running scripts is disabled on this system"*, run this once (no admin needed):
>   `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
>   If your company blocks that, use `npm.cmd` / `npx.cmd`, or switch the VS Code terminal to **Command Prompt** or **Git Bash**.
> - `ng` on its own isn't recognized because the Angular CLI is installed inside the project, not globally. Use `npm start` or `npx ng ...`.

**Changing the Angular port:**

- One run: `npx ng serve --port 4300`
- Permanently: add `"port": 4300` under `projects ▸ angular-16 ▸ architect ▸ serve ▸ options` in [angular.json](angular-16/angular.json).

> In PowerShell, `npm start -- --port 4300` does **not** work: PowerShell strips the `--`, so the option never reaches `ng serve`. Use `npx ng serve ...` for extra options.

---

## 📱 2. Run on Emulators / Simulators

Keep the server running, then open the matching URL in the emulator's browser.

| Platform | Tool | Plain version | Angular version |
|---|---|---|---|
| 🍎 **iOS Simulator** | Xcode | `http://localhost:5500/plain/test-pdf-boilerplate.html` | `http://localhost:4200/` |
| 🤖 **Android Emulator** | Android Studio | `http://10.0.2.2:5500/plain/test-pdf-boilerplate.html` | `http://10.0.2.2:4200/` |

### 🍎 iOS Simulator (Xcode — macOS only)

1. Open Xcode → **Xcode ▸ Open Developer Tool ▸ Simulator**.
2. Pick a device via **File ▸ Open Simulator**.
3. Open **Safari** in the simulator and go to the URL above.

> The iOS Simulator shares your Mac's network, so `localhost` works directly.

### 🤖 Android Emulator (Android Studio)

1. Open **Device Manager** → create or start a virtual device.
2. Open **Chrome** in the emulator and go to the URL above.

> `10.0.2.2` is the emulator's special alias for your computer's `localhost`.
> Want to use `localhost` instead? Run `adb reverse` for your port (see below).

---

## 🔌 3. Run on a Physical Device via USB

### 🤖 Android — ADB Reverse Tunnel

ADB comes with Android Studio (**SDK Platform-Tools**). Make sure `adb` is on your `PATH`.

**Phone setup (one-time):**

1. **Settings ▸ About phone** → tap **Build number** 7 times to unlock Developer Options.
2. **Settings ▸ Developer options** → enable **USB debugging**.
3. Connect via USB and accept the **"Allow USB debugging?"** prompt on the phone.

**Create the tunnel** (it forwards the phone's port to the same port on your computer over USB):

```bash
# 1. Detect the connected phone
adb devices

# 2. Forward the port for the version you're running
adb reverse tcp:5500 tcp:5500     # plain version
adb reverse tcp:4200 tcp:4200     # Angular version

# 3. (Optional) Confirm which tunnels are active
adb reverse --list
```

Then open Chrome on the phone:

| Version | URL |
|---|---|
| Plain | `http://localhost:5500/plain/test-pdf-boilerplate.html` |
| Angular | `http://localhost:4200/` |

**Multiple devices connected?** Target one by its ID (from `adb devices`):

```bash
adb -s <DEVICE_ID> reverse tcp:4200 tcp:4200
```

**Cleanup:**

```bash
adb reverse --remove tcp:4200     # remove one tunnel
adb reverse --remove-all          # remove all tunnels
```

### 🍎 iOS — USB Connection

iOS has no `adb reverse` equivalent, so a USB cable alone can't route `localhost` to your computer. Use one of these:

**Option A — Same Wi-Fi network**

1. Make the server accept connections from your network:
   - **Plain:** add `"liveServer.settings.host": "0.0.0.0"` to `.vscode/settings.json`, then restart Live Server.
   - **Angular:** run `npx ng serve --host 0.0.0.0`.
2. Find your computer's local IP:
   - **macOS:** `ipconfig getifaddr en0`
   - **Windows:** `ipconfig` → look for *IPv4 Address*
3. On the iPhone (same Wi-Fi), open Safari:
   - Plain: `http://<YOUR_LOCAL_IP>:5500/plain/test-pdf-boilerplate.html`
   - Angular: `http://<YOUR_LOCAL_IP>:4200/`

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

You need two terminals: one runs the server, the other runs the tunnel.

### Plain version

1. Start Live Server (port `5500`).
2. In a second terminal:
   ```bash
   cloudflared tunnel --url http://localhost:5500
   ```
3. Open `https://<random>.trycloudflare.com/plain/test-pdf-boilerplate.html`.

### Angular version

1. Start the dev server with the host check turned off:
   ```powershell
   cd angular-16
   npm run start:tunnel
   ```
2. In a second terminal:
   ```bash
   cloudflared tunnel --url http://localhost:4200
   ```
3. Open `https://<random>.trycloudflare.com/`.

> The Angular dev server rejects requests under unfamiliar hostnames with **"Invalid Host header"**. `npm run start:tunnel` adds `--disable-host-check` to allow the tunnel's hostname. Use it for local testing only.

**Optional — tunnel the production build instead** (smaller and closer to what you'd deploy, no host check; rebuild after each change):

```powershell
cd angular-16
npm run build
npx http-server dist/angular-16 -p 8080 --proxy "http://localhost:8080?"
cloudflared tunnel --url http://localhost:8080    # in a second terminal
```

> `--proxy "http://localhost:8080?"` sends unknown paths back to `index.html`, so opening or refreshing `/object` or `/pdfjs` directly works instead of returning 404.

### Finding the URL

`cloudflared` prints a line like this:

```
Your quick Tunnel has been created! Visit it at:
https://random-words-here.trycloudflare.com
```

Press `Ctrl+C` to stop the tunnel.

> [!WARNING]
> - Quick tunnels are **temporary** — you get a new URL each time you run the command.
> - **Anyone with the link can access the page** while the tunnel is running. Don't expose sensitive PDFs.
> - For a permanent URL on your own domain, set up a [named tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) with a Cloudflare account.

---

## 🅰️ 5. How the Angular Preview Works

The Angular app has three pages, set up in [app.routes.ts](angular-16/src/app/app.routes.ts):

| Path | Component | Shows |
|---|---|---|
| `/` | `PdfPreviewComponent` | Two links for choosing a preview flow |
| `/object` | `PdfObjectViewerComponent` | The browser's own PDF viewer in an `<object>` |
| `/pdfjs` | `PdfJsViewerComponent` | Each page drawn onto a `<canvas>` by PDF.js |

The two flows are **completely separate**: neither one imports the other, falls back to it, or shares styles with it. Each page has its own heading, **Download** / **Back** / **Share Link** buttons and stylesheet, so you can read or copy one flow on its own. **Back** returns to the chooser.

The PDF path is set once, as `PDF_SRC` in [app.routes.ts](angular-16/src/app/app.routes.ts). The router passes it to each viewer's `src` input through route `data`, because `withComponentInputBinding()` is enabled in [app.config.ts](angular-16/src/app/app.config.ts).

### `<object>` flow — `/object`

[pdf-object-viewer.component.ts](angular-16/src/app/pdf-object-viewer/pdf-object-viewer.component.ts) points an `<object>` at the PDF and lets the browser display it. If the browser has no PDF viewer (for example, Android in-app browsers), it shows the text inside the `<object>` tag instead: *"This browser can't display the PDF here."* There is no automatic switch to PDF.js.

### PDF.js flow — `/pdfjs`

[pdfjs-viewer.component.ts](angular-16/src/app/pdfjs-viewer/pdfjs-viewer.component.ts) draws the PDF itself:

1. After the view is ready, it loads PDF.js with `import('pdfjs-dist')`. The work runs outside Angular's change detection.
2. It points `GlobalWorkerOptions.workerSrc` at `assets/pdfjs/pdf.worker.min.js`, the background worker that parses the PDF.
3. `getDocument(url)` loads the PDF.
4. For each page, it creates a `<canvas>` scaled to the container's width × `devicePixelRatio` (so text stays sharp on high-DPI screens) and calls `page.render()`.

If anything fails, the error is logged to the console and the frame stays empty.

| | `/object` | `/pdfjs` |
|---|---|---|
| Looks the same everywhere | ❌ Depends on the browser's viewer | ✅ |
| Works without a built-in viewer (e.g. Android in-app browsers) | ❌ | ✅ |
| Browser zoom / text selection / search | ✅ | ❌ Pages are images |
| Extra download | None | PDF.js (~75 kB gzipped) + worker (~1 MB) |

### Angular-specific notes

| Topic | Detail |
|---|---|
| `<object [data]>` | Angular blocks the binding unless the URL is trusted with `DomSanitizer.bypassSecurityTrustResourceUrl`. |
| PDF.js version | Pinned to `pdfjs-dist` **3.11.x**. Version 4+ causes build problems with Angular 16 and needs newer browsers. |
| PDF.js loading | Loaded with a dynamic `import('pdfjs-dist')`, so it's a separate file that only downloads when `/pdfjs` is opened. |
| PDF.js worker | Copied from `node_modules/pdfjs-dist/build` to `assets/pdfjs/` by the `assets` entry in [angular.json](angular-16/angular.json). Copy that entry when moving the component into your app. |
| Canvas styles | The canvases are created in code, so they don't get Angular's scoped style attribute. Their styles use `::ng-deep`. |
| Styles | All styles are SCSS. Each component has its own `.scss` file; [styles.scss](angular-16/src/styles.scss) is empty. |
| Current limits | No zoom or text selection in PDF.js, pages aren't redrawn on rotation/resize, and every page is drawn up front (fine for short notices). |

---

## ⚡ Quick Reference

| Scenario | Plain version | Angular version |
|---|---|---|
| Start server | Live Server → **Go Live** | `npm start` (in `angular-16/`) |
| Desktop browser | `http://127.0.0.1:5500/plain/test-pdf-boilerplate.html` | `http://localhost:4200/` |
| iOS Simulator | `http://localhost:5500/plain/test-pdf-boilerplate.html` | `http://localhost:4200/` |
| Android Emulator | `http://10.0.2.2:5500/plain/test-pdf-boilerplate.html` | `http://10.0.2.2:4200/` |
| Android phone (USB) | `adb reverse tcp:5500 tcp:5500` → `http://localhost:5500/plain/test-pdf-boilerplate.html` | `adb reverse tcp:4200 tcp:4200` → `http://localhost:4200/` |
| iPhone (same Wi-Fi) | `http://<YOUR_LOCAL_IP>:5500/plain/test-pdf-boilerplate.html` | `npx ng serve --host 0.0.0.0` → `http://<YOUR_LOCAL_IP>:4200/` |
| Anywhere (Cloudflare) | `cloudflared tunnel --url http://localhost:5500` → `…/plain/test-pdf-boilerplate.html` | `npm run start:tunnel` + `cloudflared tunnel --url http://localhost:4200` → `…/` |

| ADB Command | Purpose |
|---|---|
| `adb devices` | List connected devices |
| `adb reverse tcp:<PORT> tcp:<PORT>` | Tunnel phone port → computer port |
| `adb -s <ID> reverse tcp:<PORT> tcp:<PORT>` | Tunnel for a specific device |
| `adb reverse --list` | Show active tunnels |
| `adb reverse --remove-all` | Remove all tunnels |

---

## 🛠 Troubleshooting

### General

| Problem | Fix |
|---|---|
| `adb devices` shows nothing / `unauthorized` | Re-plug the cable, accept the USB debugging prompt, try a data-capable cable. |
| `adb: command not found` | Add Android SDK `platform-tools` to your `PATH`. |
| Page loads but PDF is blank | Check the PDF exists at the expected path (`plain/test_notice.pdf` or `angular-16/src/assets/test_notice.pdf`) and is valid. |
| PDF looks cropped or scaled oddly | The layout targets **A4** — confirm your PDF's page size. |
| iPhone can't reach local IP | Confirm same Wi-Fi, the server listens on `0.0.0.0`, and your firewall allows the port. |
| Cloudflare URL returns 502 | The server isn't running, or it's on a different port than the tunnel. |
| `cloudflared` not recognized | Install it (see [Prerequisites](#-prerequisites)), then open a new terminal. |

### Plain version

| Problem | Fix |
|---|---|
| Live Server opened on a different port | Port `5500` was busy, so Live Server picked another. Free up `5500` or use the port shown in the VS Code status bar. |

### Angular version

| Problem | Fix |
|---|---|
| `npm` fails: *"running scripts is disabled on this system"* | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, or use `npm.cmd` / Command Prompt / Git Bash. |
| `ng` is not recognized | Use `npm start` or `npx ng ...` (the CLI is installed in the project, not globally). |
| *"Port 4200 is already in use"* | Another `ng serve` is still running — stop it with `Ctrl+C` in its terminal, or use `npx ng serve --port 4300`. |
| *"Invalid Host header"* over Cloudflare | Start with `npm run start:tunnel`. `npm start -- --disable-host-check` doesn't work in PowerShell. |
| Page keeps reloading over Cloudflare | Use `npx ng serve --disable-host-check --live-reload=false`. |
| `/pdfjs` frame stays empty | Check the browser console. Usually the worker file (`assets/pdfjs/pdf.worker.min.js`) or the PDF failed to load. |
| `/object` shows *"This browser can't display the PDF here."* | The browser has no built-in PDF viewer (common in Android in-app browsers). Use `/pdfjs` instead. |
| `/object` or `/pdfjs` returns 404 in a production build | The static server needs to send unknown paths to `index.html`. With `http-server`, add `--proxy "http://localhost:8080?"`. |
| *"Can't resolve 'src/styles.css'"* after pulling | `ng serve` only reads `angular.json` at startup. Stop it with `Ctrl+C` and run `npm start` again. |
