import { Component, DestroyRef, OnInit, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

const SEARCH_DEBOUNCE_MS = 250;

@Component({
  selector: 'app-contestant-list-search-bar',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <label [for]="inputId" class="sr-only">
      {{ 'filters.searchLabel' | translate }}
    </label>
    <input
      [id]="inputId"
      type="search"
      [value]="draft()"
      (input)="onInput($event)"
      [placeholder]="'filters.searchPlaceholder' | translate"
      class="w-full rounded-lg border border-(--color-pink)/40 bg-(--color-surface-elevated) px-3 py-2 text-sm text-(--color-text) placeholder-(--color-text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-pink) focus:border-(--color-pink)"
      [attr.aria-label]="'filters.searchLabel' | translate"
      autocomplete="off"
    />
  `,
})
export class ContestantListSearchBarComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly query$ = new Subject<string>();

  readonly value = input<string>('');
  readonly valueChange = output<string>();

  protected readonly draft = signal('');
  protected readonly inputId = 'contestant-search-input';

  constructor() {
    effect(() => {
      this.draft.set(this.value());
    });
  }

  ngOnInit(): void {
    this.query$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => this.valueChange.emit(query));
  }

  protected onInput(event: Event): void {
    const el = event.target as HTMLInputElement | null;
    const next = el?.value ?? '';
    this.draft.set(next);
    this.query$.next(next);
  }
}
