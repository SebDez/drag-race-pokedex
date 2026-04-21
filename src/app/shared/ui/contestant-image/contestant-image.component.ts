import { Component, input, signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-contestant-image',
  standalone: true,
  templateUrl: './contestant-image.component.html',
})
export class ContestantImageComponent {
  constructor() {
    effect(() => {
      this.src();
      this.loadFailed.set(false);
      this.imageDecoded.set(false);
    });
  }

  readonly src = input<string>('');
  readonly alt = input<string>('');
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly priority = input(false);
  readonly objectFit = input<'cover' | 'contain'>('cover');
  readonly wrapperClass = input<string>('');

  protected readonly loadFailed = signal(false);
  protected readonly imageDecoded = signal(false);

  protected readonly hasSrc = computed(() => this.src().trim().length > 0);

  protected readonly showLoadedImage = computed(() => this.imageDecoded() && !this.loadFailed());

  protected loadingAttr(): 'eager' | 'lazy' {
    return this.priority() ? 'eager' : 'lazy';
  }

  protected fetchPriorityAttr(): 'high' | 'low' {
    return this.priority() ? 'high' : 'low';
  }

  protected onLoad(): void {
    this.imageDecoded.set(true);
  }

  protected onError(): void {
    this.loadFailed.set(true);
    this.imageDecoded.set(true);
  }
}
