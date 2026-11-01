import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Contestant } from '@app/core/contestants/models/contestant.model';
import { GroupMode } from '@app/core/contestants/constants/group-mode.constants';
import {
  ContestantCardComponent,
  type ContestantSelectEvent,
} from './contestant-card/contestant-card.component';
import { ContestantGroupSectionComponent } from './contestant-group-section/contestant-group-section.component';
import {
  type ContestantSectionSeason,
  type ContestantsViewModel,
} from '@app/core/contestants/models/contestant-view.model';
import { isSameContestantSelection } from './contestant-selection.util';

@Component({
  selector: 'app-contestant-list',
  standalone: true,
  imports: [ContestantCardComponent, ContestantGroupSectionComponent, TranslateModule],
  templateUrl: './contestant-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContestantListComponent {
  protected readonly GroupMode = GroupMode;
  readonly viewModel = input.required<ContestantsViewModel>();
  readonly selectedContestant = input<Contestant | null>(null);
  readonly selectedDisplayedSeason = input<ContestantSectionSeason | undefined>(undefined);
  readonly selectContestant = output<ContestantSelectEvent>();

  protected trackByDragName(_index: number, contestant: Contestant): string {
    return contestant.dragName;
  }

  protected isSelected(contestant: Contestant, season?: ContestantSectionSeason): boolean {
    return isSameContestantSelection(
      this.selectedContestant(),
      this.selectedDisplayedSeason(),
      contestant,
      season,
    );
  }

  protected onSelect(event: ContestantSelectEvent): void {
    this.selectContestant.emit(event);
  }
}
