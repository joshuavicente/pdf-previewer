import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// Lets the user pick which preview flow to try.
@Component({
  selector: 'app-pdf-preview',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './pdf-preview.component.html',
  styleUrls: ['./pdf-preview.component.scss'],
})
export class PdfPreviewComponent {}
