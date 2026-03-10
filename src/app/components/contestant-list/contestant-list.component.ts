import { Component, computed, input } from '@angular/core';
import { Contestant } from '../../contestants/models/contestant';
import { ContestantCardComponent } from './contestant-card/contestant-card.component';
import { ContestantGroupSectionComponent } from './contestant-group-section/contestant-group-section.component';
import { ContestantGroupMode } from './contestant-group-mode';
import { FRANCHISE_COUNTRY_MAP } from '../badges/franchise-badge/franchise-badge.component';
@Component({
  selector: 'app-contestant-list',
  standalone: true,
  imports: [ContestantCardComponent, ContestantGroupSectionComponent],
  templateUrl: './contestant-list.component.html',
})
export class ContestantListComponent {
  readonly contestants = input.required<Contestant[]>();
  readonly groupMode = input<ContestantGroupMode>('all');

  protected readonly groupedByLetter = computed(() => {
    const all = this.contestants();
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    return letters
      .map((letter) => ({
        key: letter,
        contestants: all.filter((c) => c.dragName?.trim().toUpperCase().startsWith(letter)),
      }))
      .filter((group) => group.contestants.length > 0);
  });

  protected readonly groupedByFranchise = computed(() => {
    const all = this.contestants();
    const franchises = Object.keys(FRANCHISE_COUNTRY_MAP);

    return franchises
      .map((franchise) => ({
        key: franchise,
        contestants: all.filter((c) => c.firstFranchise === franchise),
      }))
      .filter((group) => group.contestants.length > 0);
  });

  protected trackByDragName(_index: number, contestant: Contestant): string {
    return contestant.dragName;
  }
}

