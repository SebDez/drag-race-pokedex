import { Component, input } from '@angular/core';

@Component({
  selector: 'app-franchise-badge',
  standalone: true,
  host: { class: 'inline-flex h-full items-center' },
  template: `@if (franchiseName()) {
    <span
      class="inline-flex items-center text-xs text-[var(--color-text-muted)] px-2"
      [class.truncate]="truncate()"
      [class.max-w-[120px]]="truncate()"
      [class.sm:max-w-[160px]]="truncate()"
      [attr.title]="truncate() ? franchiseName() : null"
    >
      @if (country(); as countryValue) {
        {{ franchiseName() }}
        <span class="mx-1 opacity-70">·</span>
        {{ countryValue }}
      } @else {
        {{ franchiseName() }}
      }
    </span>
  }`,
})
export class FranchiseBadgeComponent {
  readonly franchiseName = input.required<string>();
  readonly country = input<string>();
  readonly truncate = input<boolean>(false);
}
