import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TrophyIconComponent } from '../../icons/trophy-icon.component';

@Component({
  selector: 'app-wins-badge',
  standalone: true,
  imports: [TranslateModule, TrophyIconComponent],
  template: `@if (count() > 0) {
    <span
      class="h-8 inline-flex items-center justify-center gap-1 text-md font-semibold uppercase tracking-wider py-0 px-2 rounded-md bg-[var(--color-pink-light)] text-[var(--color-pink)]"
      [attr.title]="(count() === 1 ? 'common.win' : 'common.wins') | translate: { count: count() }"
    >
      {{ count() }}
      <app-trophy-icon class="inline-block size-4" />
    </span>
  }`,
})
export class WinsBadgeComponent {
  readonly count = input.required<number>();
}
