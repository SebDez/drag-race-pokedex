import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CrownIconComponent } from '../../icons/crown-icon.component';

@Component({
  selector: 'app-winner-badge',
  standalone: true,
  imports: [TranslateModule, CrownIconComponent],
  host: { class: 'inline-flex h-full' },
  template: `@if (show()) {
    <span
      class="inline-flex items-center justify-center gap-1 h-full font-semibold uppercase tracking-wider py-0 px-2 rounded-md bg-[var(--color-gold-light)] text-[var(--color-gold-dark)] "
      [attr.title]="'common.winner' | translate"
    >
      <app-crown-icon class="inline-block size-6" />
    </span>
  }`,
})
export class WinnerBadgeComponent {
  readonly show = input<boolean>(true);
}
