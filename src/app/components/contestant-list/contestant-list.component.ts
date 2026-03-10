import { Component, input } from '@angular/core';
import { Contestant } from '../../contestants/models/contestant';
import { GroupMode } from '../../contestants/constants/group-mode';
import { ContestantCardComponent } from './contestant-card/contestant-card.component';
import { ContestantGroupSectionComponent } from './contestant-group-section/contestant-group-section.component';
import { type ContestantsViewModel } from '../../store/contestants/types';

@Component({
  selector: 'app-contestant-list',
  standalone: true,
  imports: [ContestantCardComponent, ContestantGroupSectionComponent],
  templateUrl: './contestant-list.component.html',
})
export class ContestantListComponent {
  protected readonly GroupMode = GroupMode;
  readonly viewModel = input.required<ContestantsViewModel>();

  protected trackByDragName(_index: number, contestant: Contestant): string {
    return contestant.dragName;
  }
}
