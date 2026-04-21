import { Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contestant-list-search-bar',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <label [for]="inputId()" class="sr-only">
      {{ 'filters.searchLabel' | translate }}
    </label>
    <input
      [id]="inputId()"
      type="search"
      [value]="value()"
      (input)="onInput($event)"
      [placeholder]="'filters.searchPlaceholder' | translate"
      class="w-full rounded-lg border border-(--color-pink)/40 bg-(--color-surface-elevated) px-3 py-2 text-sm text-(--color-text) placeholder-(--color-text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-pink) focus:border-(--color-pink)"
      [attr.aria-label]="'filters.searchLabel' | translate"
      autocomplete="off"
    />
  `,
})
export class ContestantListSearchBarComponent {
  readonly value = input<string>('');
  readonly valueChange = output<string>();

  protected inputId(): string {
    return 'contestant-search-input';
  }

  protected onInput(event: Event): void {
    const el = event.target as HTMLInputElement | null;
    const next = el?.value ?? '';
    this.valueChange.emit(next);
  }
}
