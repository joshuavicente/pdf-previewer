import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type PreviewMode = 'object' | 'pdfjs' | 'failed';

const PDFJS_WORKER_SRC = 'assets/pdfjs/pdf.worker.min.js';

@Component({
  selector: 'app-pdf-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf-preview.component.html',
  styleUrls: ['./pdf-preview.component.css'],
})
export class PdfPreviewComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) src!: string;
  @Input() shareText = 'View my tax notice';

  @ViewChild('fallback') fallbackRef?: ElementRef<HTMLElement>;
  @ViewChild('pages') pagesRef?: ElementRef<HTMLElement>;

  mode: PreviewMode = 'pdfjs';
  objectUrl!: SafeResourceUrl;
  readonly canShare = typeof navigator.share === 'function';
  private readonly isAndroid = /Android/i.test(navigator.userAgent);

  constructor(
    private sanitizer: DomSanitizer,
    private location: Location,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    // Angular blocks URLs bound to <object [data]> unless explicitly trusted.
    this.objectUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${this.src}#toolbar=0&navpanes=0&scrollbar=0`,
    );

    // The browser reports it has no PDF viewer, so skip <object> entirely.
    // Add ?forcePdfJs to the URL to test the PDF.js path on desktop.
    const forcePdfJs = new URLSearchParams(location.search).has('forcePdfJs');
    if (forcePdfJs || navigator.pdfViewerEnabled === false) {
      this.mode = 'pdfjs';
    }
  }

  ngAfterViewInit(): void {
    if (this.mode === 'pdfjs') {
      this.renderWithPdfJs();
      return;
    }

    // The <object> fallback content only renders when the PDF can't be shown
    // (no viewer, failed load, etc.). Check once the page has settled.
    afterPageLoad(() => {
      const fallback = this.fallbackRef?.nativeElement;
      if (fallback && fallback.getClientRects().length > 0) {
        this.zone.run(() => (this.mode = 'pdfjs'));
        this.renderWithPdfJs();
      }
    });
  }

  private pdfUrl(): string {
    return new URL(this.src, window.location.href).href;
  }

  // Must stay synchronous: window.open / intent navigation is only allowed
  // while the browser still treats the call as part of the user's tap.
  openPdf(): void {
    if (this.isAndroid) {
      // In-app browsers on Android are WebViews with no PDF viewer and often
      // ignore new tabs, so hand the PDF to the user's default browser.
      // Set via location (not [href]) so Angular doesn't prefix it "unsafe:".
      window.location.href = browserIntentUrl(this.pdfUrl());
    } else {
      window.open(this.pdfUrl(), '_blank', 'noopener');
    }
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

  // Draws every page onto a canvas. PDF.js is loaded on demand so it only
  // costs bandwidth when the native preview fails.
  private renderWithPdfJs(): void {
    this.zone.runOutsideAngular(async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;

        const pdf = await pdfjsLib.getDocument(this.pdfUrl()).promise;
        const container = this.pagesRef!.nativeElement;
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
            canvasContext: canvas.getContext('2d')!,
            viewport,
          }).promise;
        }
      } catch (err) {
        console.error('PDF.js failed to render the notice:', err);
        this.zone.run(() => (this.mode = 'failed'));
      }
    });
  }
}

function afterPageLoad(callback: () => void): void {
  if (document.readyState === 'complete') {
    setTimeout(callback);
  } else {
    window.addEventListener('load', () => setTimeout(callback), { once: true });
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
