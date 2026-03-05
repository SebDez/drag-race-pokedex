import { Directive, ElementRef, afterNextRender, output, inject, OnDestroy } from '@angular/core';

/**
 * Emit an event when the host element enters the viewport.
 */
@Directive({
  selector: '[appObserveVisible]',
  standalone: true,
})
export class ObserveVisibleDirective implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private observer: IntersectionObserver | null = null;

  /** Emitted when the element becomes visible (enters the viewport). */
  readonly visible = output<void>();

  constructor() {
    afterNextRender(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            this.visible.emit();
          }
        },
        {
          rootMargin: '100px',
          threshold: 0,
        },
      );
      this.observer.observe(this.el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
