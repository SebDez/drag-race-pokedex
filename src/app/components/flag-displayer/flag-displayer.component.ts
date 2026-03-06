import { Component, input } from '@angular/core';
import { UsaFlagIconComponent } from '../icons/usa-flag-icon.component';
import { FranceFlagIconComponent } from '../icons/france-flag-icon.component';
import { SpainFlagIconComponent } from '../icons/spain-flag-icon.component';
@Component({
  selector: 'app-flag-displayer',
  standalone: true,
  imports: [UsaFlagIconComponent, FranceFlagIconComponent, SpainFlagIconComponent],
  templateUrl: './flag-displayer.component.html',
  host: { class: 'inline-flex items-center shrink-0' },
})
export class FlagDisplayerComponent {
  /** Country code ISO 3166-1 alpha-2 (ex. "US", "FR"). */
  readonly countryCode = input<string | null>(null);
  readonly title = input<string>('');
  /** Tailwind size class (ex. "size-4", "size-6"). */
  readonly sizeClass = input<string>('size-4');
}
