import { Injectable, signal } from '@angular/core';

export interface ImageLightboxState {
  src: string;
  alt: string;
  closeLabelKey: string;
  dialogLabelKey: string;
}

@Injectable({ providedIn: 'root' })
export class ImageLightboxService {
  private readonly state = signal<ImageLightboxState | null>(null);

  readonly active = this.state.asReadonly();

  open(
    src: string,
    alt = '',
    options?: { closeLabelKey?: string; dialogLabelKey?: string },
  ): void {
    const url = src.trim();
    if (!url) {
      return;
    }
    this.state.set({
      src: url,
      alt,
      closeLabelKey: options?.closeLabelKey ?? 'detail.closePreview',
      dialogLabelKey: options?.dialogLabelKey ?? 'detail.enlargeImage',
    });
  }

  close(): void {
    this.state.set(null);
  }
}
