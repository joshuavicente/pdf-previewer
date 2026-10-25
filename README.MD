# 📄 PDF Preview Boilerplate

A demo for previewing, opening, and downloading a PDF in mobile browsers and in-app webviews (iOS & Android).

| Version | What it is | Port | URL path |
|---|---|---|---|
| **[plain/](plain/)** | Single HTML file, browser's own PDF viewer (`<object>`) | `5500` | `/plain/test-pdf-boilerplate.html` |
| **[angular-16/](angular-16/)** | Angular 16 app comparing `<object>` vs [PDF.js](https://mozilla.github.io/pdf.js/) on `<canvas>` | `4200` | `/`, `/object`, `/pdfjs` |

> [!IMPORTANT]
> **Bring your own A4 PDF** — `*.pdf` is git-ignored.
> - **Plain:** save it as `plain/test_notice.pdf` (or update the four `test_notice.pdf` references in [test-pdf-boilerplate.html](plain/test-pdf-boilerplate.html)).
> - **Angular:** put it in `angular-16/src/assets/` and set `PDF_SRC` in [app.routes.ts](angular-16/src/app/app.routes.ts).

## 🧰 Prerequisites

- **Plain:** VS Code + **Live Server** extension (or any static server, e.g. `python -m http.server 5500`)
- **Angular:** Node.js 16.14+ / 18.10+ (newer works with a warning)
- **Optional:** Android Studio (emulator, `adb`), Xcode (iOS Simulator), `cloudflared` (public URL)

## 🚀 Run Locally

**Plain:** right-click `plain/test-pdf-boilerplate.html` → **Open with Live Server**.

**Angular:**

```bash
cd angular-16
npm install
npm start          # ng serve → http://localhost:4200/
```

Other scripts: `npm run start:tunnel` (for Cloudflare) and `npm run build`. To change the port, use `npx ng serve --port 4300` (`npm start -- --port` doesn't work in PowerShell).

## 📱 Test on Devices

Keep the server running, then open these URLs (`<port>` = `5500` or `4200`, plus the page path):

| Where | URL / setup |
|---|---|
| iOS Simulator | `http://localhost:<port>` |
| Android Emulator | `http://10.0.2.2:<port>` |
| Android phone (USB) | Enable USB debugging, run `adb reverse tcp:<port> tcp:<port>`, then `http://localhost:<port>` |
| iPhone (same Wi-Fi) | Serve on `0.0.0.0` (Live Server: `"liveServer.settings.host": "0.0.0.0"`; Angular: `npx ng serve --host 0.0.0.0`), then `http://<your-local-ip>:<port>` |

**Debugging iOS:** enable Web Inspector on the iPhone (**Settings ▸ Apps ▸ Safari ▸ Advanced**) and on the Mac (**Safari ▸ Settings ▸ Advanced ▸ Show features for web developers**), then use **Develop ▸ [iPhone]**.

## 🌐 Public URL (Cloudflare Tunnel)

For in-app browsers (Messenger, Instagram, Slack…) or sharing. Start the server (Angular: `npm run start:tunnel`), then in a second terminal:

```bash
cloudflared tunnel --url http://localhost:<port>
```

Open the printed `https://<random>.trycloudflare.com` URL.

> [!WARNING]
> Quick tunnel URLs change each run and are **public** while running — don't expose sensitive PDFs.

## 🅰️ How the Angular App Works

`/` is a chooser; `/object` and `/pdfjs` are fully independent flows. The PDF path is set once as `PDF_SRC` and passed to each viewer via route data.

| | `/object` | `/pdfjs` |
|---|---|---|
| How | Browser's built-in viewer in an `<object>` | PDF.js renders each page to a `<canvas>` |
| Consistent across browsers | ❌ | ✅ |
| Works without a built-in viewer (Android in-app) | ❌ shows a fallback link (`intent://` on Android) | ✅ |
| Zoom / text selection / search | ✅ | ❌ |
| Extra download | None | ~75 kB + ~1 MB worker |

Notes:
- `pdfjs-dist` is pinned to **3.11.x** (4+ breaks with Angular 16) and lazy-loaded only on `/pdfjs`.
- The worker is copied to `assets/pdfjs/` by [angular.json](angular-16/angular.json) — copy that entry if you move the component.
- PDF.js limits: no zoom, no re-render on resize, all pages drawn up front.

## 🛠 Troubleshooting

| Problem | Fix |
|---|---|
| PDF blank | Check the PDF exists at the expected path and is valid. |
| `adb devices` empty / `unauthorized` | Re-plug, accept the debugging prompt, use a data cable. |
| `npm` "running scripts is disabled" (PowerShell) | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, or use Command Prompt / Git Bash. |
| `ng` not recognized | Use `npm start` or `npx ng ...`. |
| "Invalid Host header" over Cloudflare | Use `npm run start:tunnel`. |
| Cloudflare 502 | Server not running, or tunnel port doesn't match. |
| `/pdfjs` empty | Check the console — usually the worker or PDF failed to load. |
| `/object` shows "Preview Unavailable" | No built-in viewer (common in Android in-app browsers). Tap the link or use `/pdfjs`. |
| 404 on `/object` or `/pdfjs` in a prod build | Serve with SPA fallback, e.g. `npx http-server dist/angular-16 -p 8080 --proxy "http://localhost:8080?"`. |
