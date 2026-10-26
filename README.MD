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
| Extra download | None | ~125 kB + ~1.3 MB worker |

Notes:
- `pdfjs-dist` is pinned to **6.4.299** and lazy-loaded only on `/pdfjs`. Don't go below 4.2.67: older versions (including the common 3.x) have [CVE-2024-4367](https://github.com/advisories/GHSA-wgrm-67xf-hhpq), where a malicious PDF can run JavaScript in your page.
- Its type definitions need TypeScript 5.6+, but Angular 16 is stuck on TS 5.1, so [tsconfig.json](angular-16/tsconfig.json) sets `skipLibCheck: true`. Your own code is still type-checked.
- Angular 16's `zone.js` replaces the global `Promise` with one missing `Promise.withResolvers` / `Promise.try`, which PDF.js 6 needs. `addPromisePolyfills()` in [pdfjs-viewer.component.ts](angular-16/src/app/pdfjs-viewer/pdfjs-viewer.component.ts) adds them back before PDF.js loads — keep it, or `/pdfjs` stays blank.
- The app uses PDF.js's **legacy build** (`pdfjs-dist/legacy/build/…`) for both the library and the worker. The standard build relies on very new browser features (e.g. `Uint8Array.toHex`, Chrome 140+) and shows a blank page on older browsers and WebViews.
- The worker (`pdf.worker.min.mjs`) is copied to `assets/pdfjs/` by [angular.json](angular-16/angular.json) — copy that entry if you move the component.
- PDF.js limits: no zoom, no re-render on resize, all pages drawn up front.

### PDF.js flow

What [pdfjs-viewer.component.ts](angular-16/src/app/pdfjs-viewer/pdfjs-viewer.component.ts) does, in order:

```text
fetch(src) → Blob                            → download once, keep in memory
import('pdfjs-dist/legacy/build/pdf.mjs')    → get the library (lazy-loaded)
GlobalWorkerOptions.workerSrc                → point to the background worker
getDocument({ data })                        → open the PDF     → pdf
  └─ for each page:
       pdf.getPage(i)                        → get the page     → page
       page.getViewport({ scale })           → decide the size  → viewport
       create <canvas> of that size
       page.render({ canvas, viewport })     → draw it
```

- `scale` = container width ÷ page width (fits the page to the screen), × `devicePixelRatio` so it stays sharp on high-DPI phones.
- It all runs outside Angular's zone, so drawing pages doesn't trigger change detection.
- If anything fails, a "Preview Unavailable" message replaces the pages. Its link opens the in-memory Blob in the browser's own PDF viewer (or the file URL if the download itself failed).

## ⚖️ `<object>` vs PDF.js — Pros & Cons

### `<object>` (browser's built-in viewer)

**Pros**
- Zero dependencies and almost no code; works in the plain HTML version too.
- Full viewer for free on desktop: zoom, search, text selection, print, page thumbnails.
- Native rendering — fast, low memory, handles large PDFs well.
- No CORS needed: the browser loads the PDF like any other resource.
- Built-in fallback content (the "Preview Unavailable" block) when the browser can't display it.

**Cons**
- **Mobile is unreliable.** Android Chrome and Android WebViews (in-app browsers) have no inline PDF viewer, so users only see the fallback. iOS Safari/WKWebView may show only the first page or not scroll inside the frame.
- Look and behaviour differ per browser — you can't style or control the viewer.
- URL options like `#toolbar=0&navpanes=0` are only honoured by some viewers (mainly Chromium); others ignore them.
- Hard to tell from JS whether the PDF actually rendered.

### PDF.js (pages drawn on `<canvas>`)

**Pros**
- Same result on every browser and WebView, including Android in-app browsers.
- Full control over layout and UI — it's just canvases in your page.
- Lazy-loaded here, so it only costs bandwidth on `/pdfjs`.
- Programmatic access to the document (page count, metadata, text) if you need it later.

**Cons**
- Extra download (~125 kB library + ~1.3 MB worker) and noticeably more CPU/memory, especially for long PDFs at high `devicePixelRatio`.
- You build every feature yourself: zoom, search, text selection, printing, resize handling. This demo has none of them.
- Canvas is just pixels: no selectable text and poor screen-reader support unless you add PDF.js's text layer.
- The PDF is fetched via JS, so cross-origin PDFs need CORS headers.
- It's a dependency to keep updated, since it parses untrusted files in your page (see the CVE note above).

### Which to use?

- **Desktop-only, or you just need a quick preview:** `<object>` — less code and a better viewer.
- **Must work on mobile / in-app browsers, or needs a consistent look:** PDF.js.
- **Both:** a common pattern is PDF.js for the preview, with a **Download** / "open in browser" link so users can still use their native viewer for zoom, search and print.

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
| Type errors in `node_modules/pdfjs-dist/types` | Make sure `"skipLibCheck": true` is in [tsconfig.json](angular-16/tsconfig.json). |
| `/object` shows "Preview Unavailable" | No built-in viewer (common in Android in-app browsers). Tap the link or use `/pdfjs`. |
| 404 on `/object` or `/pdfjs` in a prod build | Serve with SPA fallback, e.g. `npx http-server dist/angular-16 -p 8080 --proxy "http://localhost:8080?"`. |
