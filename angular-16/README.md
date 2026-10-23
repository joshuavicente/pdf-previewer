# PDF Preview — Angular 16

Angular 16 version of the PDF preview demo. It renders the PDF with PDF.js on every browser. See the [main README](../README.MD) for setup, device testing, Cloudflare and troubleshooting.

```bash
npm install
npm start                # http://localhost:4200/
npm run start:tunnel     # for Cloudflare Tunnel (disables the host check)
```

Put your own A4 PDF in `src/assets/` and set `pdfSrc` in `src/app/app.component.ts`.
