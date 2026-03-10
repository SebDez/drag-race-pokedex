import { Component, computed, input } from '@angular/core';
import { FlagDisplayerComponent } from '../../flag-displayer/flag-displayer.component';

export const FRANCHISE_COUNTRY_MAP: Record<string, string> = {
  "RuPaul's Drag Race": 'United States',
  "RuPaul's Drag Race All Stars": 'United States',
  'Drag Race Thailand': 'Thailand',
  "RuPaul's Drag Race UK": 'United Kingdom',
  "Canada's Drag Race": 'Canada',
  'Drag Race Holland': 'Netherlands',
  'Drag Race Down Under': 'Australia',
  'Drag Race España': 'Spain',
  'Drag Race Italia': 'Italy',
  "RuPaul's Drag Race UK vs The World": 'United Kingdom',
  'Drag Race France': 'France',
  'Drag Race Philippines': 'Philippines',
  "Canada's Drag Race: Canada vs The World": 'Canada',
  'Drag Race Belgique': 'Belgium',
  'Drag Race Sverige': 'Sweden',
  'Drag Race México': 'Mexico',
  'Drag Race Brasil': 'Brasil',
  'Drag Race Germany': 'Germany',
  'Drag Race España: All Stars': 'Spain',
  "RuPaul's Drag Race Global All Stars": 'United States',
  'Drag Race France All Stars': 'France',
  'Drag Race Philippines: Slaysian Royale': 'Philippines',
  'Drag Race Down Under vs The World': 'Australia',
  'Drag Race México: Latina Royale': 'Mexico',
  "Canada's Drag Race: All Stars": 'Canada',
};

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

  private readonly resolvedCountry = computed(() => {
    const countryInput = this.country();
    if (countryInput) return countryInput;
    return this.franchiseName() ? (FRANCHISE_COUNTRY_MAP[this.franchiseName()!] ?? null) : null;
  });

  readonly countryIsoCode = computed(() => {
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
