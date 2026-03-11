import { Component, inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ContestantsStore } from '../../store/contestants/contestants.store';
import { ContestantListComponent } from '../../components/contestant-list/contestant-list.component';
import { ContestantListFiltersComponent } from '../../components/contestant-list/contestant-filters/contestant-list-filters.component';
import { type ContestantGroupMode } from '../../contestants/constants/group-mode';
import { type ContestantSortMode } from '../../contestants/constants/sort-mode';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslateModule, ContestantListComponent, ContestantListFiltersComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  protected readonly store = inject(ContestantsStore);

  protected onGroupModeChange(mode: ContestantGroupMode): void {
    this.store.setGroupMode(mode);
  }

  protected onSortModeChange(mode: ContestantSortMode): void {
    this.store.setSortMode(mode);
  }

  ngOnInit(): void {
    this.store.loadContestants();
  }
}
