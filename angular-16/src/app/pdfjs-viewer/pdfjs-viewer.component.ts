import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  ViewChild,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';

const PDFJS_WORKER_SRC = 'assets/pdfjs/pdf.worker.min.js';

// Draws every page of the PDF onto a canvas with PDF.js.
@Component({
  selector: 'app-pdfjs-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdfjs-viewer.component.html',
  styleUrls: ['./pdfjs-viewer.component.scss'],
})
export class PdfJsViewerComponent implements AfterViewInit {
  @Input({ required: true }) src!: string;
  @Input() shareText = 'View my tax notice';

  @ViewChild('pages') pagesRef!: ElementRef<HTMLElement>;

  readonly canShare = typeof navigator.share === 'function';

  constructor(
    private readonly zone: NgZone,
    private readonly location: Location,
  ) {}

  ngAfterViewInit(): void {
    this.render();
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
  private render(): void {
    void this.zone.runOutsideAngular(async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;

        const url = new URL(this.src, window.location.href).href;
        const pdf = await pdfjsLib.getDocument(url).promise;
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
            canvasContext: canvas.getContext('2d')!,
            viewport,
          }).promise;
        }
      } catch (err) {
        console.error('PDF.js failed to render the notice:', err);
      }
    });
  }
}
