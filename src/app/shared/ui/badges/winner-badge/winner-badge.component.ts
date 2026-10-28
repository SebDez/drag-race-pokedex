import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CrownIconComponent } from '../../../icons/crown-icon.component';

@Component({
  selector: 'app-winner-badge',
  standalone: true,
  imports: [TranslateModule, CrownIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (show()) {
    <span
      class="inline-flex items-center justify-center gap-1 h-8 font-semibold uppercase tracking-wider py-0 px-2 rounded-md bg-[var(--color-gold-light)] text-[var(--color-gold-dark)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-gold-bright)_45%,transparent)]"
      [attr.title]="'common.winner' | translate"
      [attr.aria-label]="'common.winner' | translate"
    >
      <app-crown-icon class="inline-block size-6" aria-hidden="true" />
    </span>
  }`,
})
export class WinnerBadgeComponent {
  readonly show = input<boolean>(true);
}
