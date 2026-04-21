import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Contestant } from '@app/core/contestants/models/contestant.model';
import { GroupMode } from '@app/core/contestants/constants/group-mode.constants';
import { ContestantCardComponent } from './contestant-card/contestant-card.component';
import { ContestantGroupSectionComponent } from './contestant-group-section/contestant-group-section.component';
import { type ContestantsViewModel } from '@app/core/contestants/models/contestant-view.model';

@Component({
  selector: 'app-contestant-list',
  standalone: true,
  imports: [ContestantCardComponent, ContestantGroupSectionComponent, TranslateModule],
  templateUrl: './contestant-list.component.html',
})
export class ContestantListComponent {
  protected readonly GroupMode = GroupMode;
  readonly viewModel = input.required<ContestantsViewModel>();

  protected trackByDragName(_index: number, contestant: Contestant): string {
    return contestant.dragName;
  }
}
