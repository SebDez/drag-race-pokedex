import { Component, input } from '@angular/core';
import { Contestant } from '@app/core/contestants/models/contestant.model';
import { ContestantCardComponent } from '../contestant-card/contestant-card.component';
import { ContestantGroupMode } from '@app/core/contestants/constants/group-mode.constants';
import { ContestantSectionSeason } from '@app/core/contestants/models/contestant-view.model';

@Component({
  selector: 'app-contestant-group-section',
  standalone: true,
  imports: [ContestantCardComponent],
  template: `
    <section class="flex flex-col gap-3">
      <h2
        class="text-sm sm:text-base font-semibold uppercase tracking-[0.18em] text-[var(--color-text)] border-b border-[var(--color-border)] pb-1.5"
      >
        {{ title() }}
      </h2>
      <div class="flex flex-col gap-2">
        @for (contestant of contestants(); track trackByDragName($index, contestant)) {
          <app-contestant-card [contestant]="contestant" [displayedSeason]="displayedSeason()" />
        }
      </div>
    </section>
  `,
})
export class ContestantGroupSectionComponent {
  readonly title = input.required<string>();
  readonly contestants = input.required<Contestant[]>();
  readonly groupMode = input.required<ContestantGroupMode>();
  readonly displayedSeason = input<ContestantSectionSeason | undefined>();

  protected trackByDragName(_index: number, contestant: Contestant): string {
    return contestant.dragName;
  }
}
