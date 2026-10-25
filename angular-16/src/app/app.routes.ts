import { Routes } from '@angular/router';
import { PdfPreviewComponent } from './pdf-preview/pdf-preview.component';
import { PdfObjectViewerComponent } from './pdf-object-viewer/pdf-object-viewer.component';
import { PdfJsViewerComponent } from './pdfjs-viewer/pdfjs-viewer.component';

// Provide your own A4 PDF in src/assets/ and point this at it.
// Route data is bound to the viewers' `src` input (withComponentInputBinding).
const PDF_SRC = 'assets/test_notice.pdf';

export const routes: Routes = [
  { path: '', component: PdfPreviewComponent },
  { path: 'object', component: PdfObjectViewerComponent, data: { src: PDF_SRC } },
  { path: 'pdfjs', component: PdfJsViewerComponent, data: { src: PDF_SRC } },
  { path: '**', redirectTo: '' },
];
