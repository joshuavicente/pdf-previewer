import { Component } from '@angular/core';
import { PdfPreviewComponent } from './pdf-preview/pdf-preview.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PdfPreviewComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  // Provide your own A4 PDF in src/assets/ and point this at it.
  readonly pdfSrc = 'assets/test_notice.pdf';
}
