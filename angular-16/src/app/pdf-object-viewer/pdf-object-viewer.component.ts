import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Shows the PDF with the browser's built-in viewer.
@Component({
  selector: 'app-pdf-object-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf-object-viewer.component.html',
  styleUrls: ['./pdf-object-viewer.component.scss'],
})
export class PdfObjectViewerComponent implements OnInit {
  @Input({ required: true }) src!: string;
  @Input() shareText = 'View my tax notice';

  objectUrl!: SafeResourceUrl;
  readonly canShare = typeof navigator.share === 'function';

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly location: Location,
  ) {}

  ngOnInit(): void {
    // Angular blocks URLs bound to <object [data]> unless explicitly trusted.
    this.objectUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${this.src}#toolbar=0&navpanes=0&scrollbar=0`,
    );
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
}
