import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';

const PDFJS_WORKER_SRC = 'assets/pdfjs/pdf.worker.min.mjs';

// Draws every page of the PDF onto a canvas with PDF.js.
@Component({
  selector: 'app-pdfjs-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdfjs-viewer.component.html',
  styleUrls: ['./pdfjs-viewer.component.scss'],
})
export class PdfJsViewerComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) src!: string;
  @Input() shareText = 'View my tax notice';

  @ViewChild('pages') pagesRef!: ElementRef<HTMLElement>;

  readonly canShare = typeof navigator.share === 'function';
  isPdfFailed: boolean = false;
  private readonly isAndroid = /Android/i.test(navigator.userAgent);
  private blobUrl?: string;

  constructor(
    private readonly zone: NgZone,
    private readonly location: Location,
  ) {}

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnDestroy(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
    }
  }

  // Opens the in-memory copy of the PDF in the browser's own viewer. If the
  // backend never returned it, falls back to the plain file URL.
  //
  // In-app browsers on Android (e.g. the Google app) are WebViews with no
  // PDF viewer and often ignore target="_blank", so hand the PDF to the
  // user's default browser instead (a blob: URL can't leave this page). Set
  // via location (not [href]) so Angular doesn't prefix the intent:// URL
  // with "unsafe:".
  openPdf(event: MouseEvent): void {
    event.preventDefault();
    const url = new URL(this.src, window.location.href).href;

    if (this.isAndroid) {
      window.location.href = browserIntentUrl(url);
      return;
    }

    window.open(this.blobUrl ?? url, '_blank', 'noopener');
  }

  back(): void {
    this.location.back();
  }

  async shareLink(): Promise<void> {
    try {
      await navigator.share({
        title: document.title,
        text: this.shareText,
        url: window.location.href,
      });
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') {
        console.error('Failed to share link:', err);
      }
    }
  }

  // PDF.js is loaded on demand so it only costs bandwidth when it's used.
  // The PDF is fetched once and kept in memory, so "open the notice" can
  // reuse it even if PDF.js later fails to render it.
  private render(): void {
    void this.zone.runOutsideAngular(async () => {
      try {
        const res = await fetch(new URL(this.src, window.location.href).href);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const blob = new Blob([await res.blob()], { type: 'application/pdf' });
        this.blobUrl = URL.createObjectURL(blob);

        addPromisePolyfills();
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;

        const data = new Uint8Array(await blob.arrayBuffer());
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        const container = this.pagesRef.nativeElement;
        const dpr = window.devicePixelRatio || 1;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const unscaled = page.getViewport({ scale: 1 });
          const scale = container.clientWidth / unscaled.width;
          const viewport = page.getViewport({ scale: scale * dpr });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.setAttribute('aria-label', `Page ${i} of ${pdf.numPages}`);
          container.appendChild(canvas);

          await page.render({
            canvas,
            viewport,
          }).promise;
        }
      } catch (err) {
        // Back inside Angular's zone so the template updates.
        this.zone.run(() => (this.isPdfFailed = true));
      }
    });
  }
}

function browserIntentUrl(url: string): string {
  const u = new URL(url);
  const scheme = u.protocol.replace(':', '');
  return (
    `intent://${u.host}${u.pathname}${u.search}` +
    `#Intent;scheme=${scheme};` +
    `S.browser_fallback_url=${encodeURIComponent(url)};end`
  );
}

// zone.js replaces the global Promise with its own, which lacks newer static
// methods. PDF.js 6 needs these, so add them back before PDF.js loads.
function addPromisePolyfills(): void {
  const P = Promise as any;

  P.withResolvers ??= function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new P((res: typeof resolve, rej: typeof reject) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };

  P.try ??= function (fn: (...args: unknown[]) => unknown, ...args: unknown[]) {
    return new P((resolve: (value: unknown) => void) => resolve(fn(...args)));
  };
}
