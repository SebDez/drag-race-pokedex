import { Component, input } from '@angular/core';
import { Contestant } from '../../contestants/models/contestant';
import { ContestantCardComponent } from './contestant-card/contestant-card.component';
@Component({
  selector: 'app-contestant-list',
  standalone: true,
  imports: [ContestantCardComponent],
  templateUrl: './contestant-list.component.html',
})
export class ContestantListComponent {
  readonly contestants = input.required<Contestant[]>();

  protected trackByDragName(_index: number, contestant: Contestant): string {
    return contestant.dragName;
  }
}
