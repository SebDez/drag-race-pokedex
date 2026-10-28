import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TrophyIconComponent } from '../../../icons/trophy-icon.component';

@Component({
  selector: 'app-wins-badge',
  standalone: true,
  imports: [TranslateModule, TrophyIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (count() > 0) {
    <span
      class="h-8 inline-flex items-center justify-center gap-1 text-md font-semibold uppercase tracking-wider py-0 px-2 rounded-md bg-[var(--color-pink-light)] text-[var(--color-pink-dark)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-pink)_35%,transparent)]"
      [attr.title]="labelKey() | translate: { count: count() }"
      [attr.aria-label]="labelKey() | translate: { count: count() }"
    >
      <span aria-hidden="true">{{ count() }}</span>
      <app-trophy-icon class="inline-block size-4" aria-hidden="true" />
    </span>
  }`,
})
export class WinsBadgeComponent {
  readonly count = input.required<number>();

  protected labelKey(): string {
    return this.count() === 1 ? 'common.win' : 'common.wins';
  }
}
