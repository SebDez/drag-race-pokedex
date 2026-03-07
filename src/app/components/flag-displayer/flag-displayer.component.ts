import { Component, input } from '@angular/core';
import { UsaFlagIconComponent } from '../icons/usa-flag-icon.component';
import { FranceFlagIconComponent } from '../icons/france-flag-icon.component';
import { SpainFlagIconComponent } from '../icons/spain-flag-icon.component';
import { AustraliaFlagIconComponent } from '../icons/australia-flag-icon.component';
import { ThailandFlagIconComponent } from '../icons/thailand-flag-icon.component';
import { UkFlagIconComponent } from '../icons/uk-flag-icon.component';
import { CanadaFlagIconComponent } from '../icons/canada-flag-icon.component';
import { NetherlandsFlagIconComponent } from '../icons/netherlands-flag-icon.component';
import { PhilippinesFlagIconComponent } from '../icons/philippines-flag-icon.component';
import { SwedenFlagIconComponent } from '../icons/sweden-flag-icon.component';
import { MexicoFlagIconComponent } from '../icons/mexico-flag-icon.component';
import { BrasilFlagIconComponent } from '../icons/brasil-flag-icon.component';
import { GermanyFlagIconComponent } from '../icons/germany-flag-icon.component';
import { ItalyFlagIconComponent } from '../icons/italy-flag-icon.component';
import { BelgiumFlagIconComponent } from '../icons/belgium-flag-icon.component';
@Component({
  selector: 'app-flag-displayer',
  standalone: true,
  imports: [
    UsaFlagIconComponent,
    FranceFlagIconComponent,
    SpainFlagIconComponent,
    AustraliaFlagIconComponent,
    ThailandFlagIconComponent,
    UkFlagIconComponent,
    CanadaFlagIconComponent,
    NetherlandsFlagIconComponent,
    PhilippinesFlagIconComponent,
    SwedenFlagIconComponent,
    MexicoFlagIconComponent,
    BrasilFlagIconComponent,
    GermanyFlagIconComponent,
    ItalyFlagIconComponent,
    BelgiumFlagIconComponent,
  ],
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
