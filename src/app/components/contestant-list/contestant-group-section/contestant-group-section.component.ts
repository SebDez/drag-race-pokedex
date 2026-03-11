import { Component, input } from '@angular/core';
import { Contestant } from '../../../contestants/models/contestant';
import { ContestantCardComponent } from '../contestant-card/contestant-card.component';
import { ContestantGroupMode } from '../../../contestants/constants/group-mode';
import { GroupMode } from '../../../contestants/constants/group-mode';
import { ContestantSectionSeaon } from '../../../store/contestants/types';

@Component({
  selector: 'app-contestant-group-section',
  standalone: true,
  imports: [ContestantCardComponent],
  template: `
    <section class="flex flex-col gap-3">
      <h2
        class="text-sm sm:text-base font-semibold uppercase tracking-[0.18em] text-(--color-text) border-b border-(--color-border) pb-1.5"
      >
        {{ title() }}
      </h2>
      <div class="flex flex-col gap-2">
        @for (contestant of contestants(); track trackByDragName($index, contestant)) {
          <app-contestant-card
            [contestant]="contestant"
            [showOnlySeasonWinner]="shouldShowOnlySeasonWinner()"
            [displayedSeason]="displayedSeason()"
          />
        }
      </div>
    </section>
  `,
})
export class ContestantGroupSectionComponent {
  readonly title = input.required<string>();
  readonly contestants = input.required<Contestant[]>();
  readonly groupMode = input.required<ContestantGroupMode>();
  readonly displayedSeason = input<ContestantSectionSeaon | undefined>();

  protected shouldShowOnlySeasonWinner(): boolean {
    return !!this.groupMode() && !!this.displayedSeason() && this.groupMode() === GroupMode.Seasons;
  }

  protected trackByDragName(_index: number, contestant: Contestant): string {
    return contestant.dragName;
  }
}
