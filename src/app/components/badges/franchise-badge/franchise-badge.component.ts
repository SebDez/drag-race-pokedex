import { Component, computed, input } from '@angular/core';
import { FlagDisplayerComponent } from '../../flag-displayer/flag-displayer.component';
import { FRANCHISE_COUNTRY_MAP } from '../../../contestants/constants/franchises';

export { FRANCHISE_COUNTRY_MAP };

const COUNTRY_ISO_MAP: Record<string, string> = {
  'United States': 'US',
  Thailand: 'TH',
  'United Kingdom': 'GB',
  Canada: 'CA',
  Netherlands: 'NL',
  Australia: 'AU',
  Spain: 'ES',
  Italy: 'IT',
  France: 'FR',
  Philippines: 'PH',
  Belgium: 'BE',
  Sweden: 'SE',
  Mexico: 'MX',
  Brasil: 'BR',
  Germany: 'DE',
};

@Component({
  selector: 'app-franchise-badge',
  standalone: true,
  imports: [FlagDisplayerComponent],
  host: { class: 'inline-flex h-full items-center' },
  template: `@if (franchiseName(); as name) {
    <span
      class="inline-flex items-center text-xs text-(--color-text-muted)"
      [class.truncate]="truncate()"
      [class.max-w-[120px]]="truncate()"
      [class.sm:max-w-[160px]]="truncate()"
      [attr.title]="title()"
    >
      @if (countryIsoCode(); as iso) {
        <app-flag-displayer [countryCode]="iso" [title]="title()" sizeClass="size-8" />
      }
    </span>
  }`,
})
export class FranchiseBadgeComponent {
  readonly franchiseName = input.required<string>();
  readonly country = input<string>();
  readonly truncate = input<boolean>(false);

  private readonly resolvedCountry = computed<string | null>(() => {
    const countryInput = this.country();
    if (countryInput) return countryInput;
    return this.franchiseName() ? (FRANCHISE_COUNTRY_MAP[this.franchiseName()!] ?? null) : null;
  });

  readonly countryIsoCode = computed<string | null>(() => {
    const country = this.resolvedCountry();
    if (!country) return null;
    return COUNTRY_ISO_MAP[country] ?? null;
  });

  readonly title = computed<string>(() => {
    const name = this.franchiseName();
    const country = this.resolvedCountry();
    if (!name) return '';
    if (this.truncate() && country) return `${name} · ${country}`;
    if (this.truncate()) return name;
    return '';
  });
}
