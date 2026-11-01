import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  DOCUMENT,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

const LOUPE_SIZE_PX = 180;
const LOUPE_ZOOM = 2.4;

type LoupeState = {
  x: number;
  y: number;
  bgSize: string;
  bgPos: string;
};

@Component({
  selector: 'app-image-lightbox',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './image-lightbox.component.html',
  styleUrl: './image-lightbox.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageLightboxComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly src = input.required<string>();
  readonly alt = input('');
  readonly closeLabelKey = input('detail.closePreview');
  readonly dialogLabelKey = input('detail.enlargeImage');

  readonly closed = output<void>();

  protected readonly loupeSize = LOUPE_SIZE_PX;
  protected readonly loupe = signal<LoupeState | null>(null);
  protected readonly loupeAvailable = signal(false);

  ngOnInit(): void {
    // Portal to <body> so the viewer stacks above modals moved out of app-root.
    const el = this.host.nativeElement;
    if (el.parentElement !== this.document.body) {
      this.document.body.appendChild(el);
    }
    this.loupeAvailable.set(this.canUseLoupe());
  }

  ngOnDestroy(): void {
    this.host.nativeElement.remove();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closed.emit();
  }

  protected onBackdropClick(): void {
    this.closed.emit();
  }

  protected onCloseClick(event: MouseEvent): void {
    event.stopPropagation();
    this.closed.emit();
  }

  protected onImageMove(event: MouseEvent): void {
    if (!this.loupeAvailable()) {
      this.loupe.set(null);
      return;
    }

    const img = event.currentTarget as HTMLImageElement;
    const rect = img.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    const relX = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const relY = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
    const bgW = rect.width * LOUPE_ZOOM;
    const bgH = rect.height * LOUPE_ZOOM;

    this.loupe.set({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      bgSize: `${bgW}px ${bgH}px`,
      bgPos: `${-(relX * bgW - LOUPE_SIZE_PX / 2)}px ${-(relY * bgH - LOUPE_SIZE_PX / 2)}px`,
    });
  }

  protected onImageLeave(): void {
    this.loupe.set(null);
  }

  protected loupeBackgroundImage(): string {
    const raw = this.src().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `url("${raw}")`;
  }

  private canUseLoupe(): boolean {
    if (typeof window === 'undefined' || typeof matchMedia !== 'function') {
      return false;
    }
    // Desktop / fine pointer only — do not gate on prefers-reduced-motion
    // (Windows often enables it and would silently disable zoom).
    return matchMedia('(hover: hover) and (pointer: fine)').matches;
  }
}
