# PDF Preview — Angular 16

Angular 16 version of the PDF preview demo. It has two separate preview flows, each on its own page:

| Path | Flow |
|---|---|
| `/` | Links to choose a flow |
| `/object` | The browser's own PDF viewer in an `<object>` |
| `/pdfjs` | Pages drawn onto `<canvas>` by PDF.js |

See the [main README](../README.MD) for how each flow works, setup, device testing, Cloudflare and troubleshooting.

```bash
npm install
npm start                # http://localhost:4200/
npm run start:tunnel     # for Cloudflare Tunnel (disables the host check)
```

Put your own A4 PDF in `src/assets/` and set `PDF_SRC` in `src/app/app.routes.ts`.
