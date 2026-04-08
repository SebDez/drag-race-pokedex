import { Component, HostListener, inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ContestantsStore } from '../../store/contestants/contestants.store';
import { ContestantListComponent } from '../../components/contestant-list/contestant-list.component';
import { ContestantListFiltersComponent } from '../../components/contestant-list/contestant-filters/contestant-list-filters.component';
import { type ContestantGroupMode } from '../../contestants/constants/group-mode';
import { type ContestantSortMode } from '../../contestants/constants/sort-mode';
import { type ContestantFilters } from '../../contestants/models/query';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslateModule, ContestantListComponent, ContestantListFiltersComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  protected readonly store = inject(ContestantsStore);

  private scrollScheduled = false;

  protected onGroupModeChange(mode: ContestantGroupMode): void {
    this.store.setGroupMode(mode);
  }

  protected onSortModeChange(mode: ContestantSortMode): void {
    this.store.setSortMode(mode);
  }

  protected onFiltersChange(filters: ContestantFilters): void {
    this.store.setFilters(filters);
  }

  ngOnInit(): void {
    this.store.loadContestants();
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    if (this.scrollScheduled) {
      return;
    }
    this.scrollScheduled = true;
    requestAnimationFrame(() => {
      this.scrollScheduled = false;
      const store = this.store;
      if (store.loading() || store.loadingMore() || !store.hasMore()) {
        return;
      }
      const marginPx = 320;
      const scrollBottom = window.scrollY + window.innerHeight;
      const docBottom = document.documentElement.scrollHeight;
      if (scrollBottom >= docBottom - marginPx) {
        store.loadMore();
      }
    });
  }
}
