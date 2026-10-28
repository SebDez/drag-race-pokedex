import { ChangeDetectionStrategy, Component, HostListener, OnInit, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ContestantsStore } from '@app/core/contestants/store/contestant.store';
import { ContestantListComponent } from './components/contestant-list/contestant-list.component';
import { ContestantListFiltersComponent } from './components/contestant-list/contestant-filters/contestant-list-filters.component';
import {
  GroupMode,
  type ContestantGroupMode,
} from '@app/core/contestants/constants/group-mode.constants';
import { type ContestantSortMode } from '@app/core/contestants/constants/sort-mode.constants';
import { type ContestantFilters } from '@app/core/contestants/models/query.model';
import { CrownIconComponent } from '@app/shared/icons/crown-icon.component';
import { TrophyIconComponent } from '@app/shared/icons/trophy-icon.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TranslateModule,
    ContestantListComponent,
    ContestantListFiltersComponent,
    CrownIconComponent,
    TrophyIconComponent,
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private scrollScheduled = false;

  protected readonly skeletonSlots = [0, 1, 2, 3, 4, 5] as const;

  protected readonly displayedCount = computed(() => {
    const vm = this.store.viewModel();
    if (vm.mode === GroupMode.All) {
      return vm.list.length;
    }
    return vm.sections?.reduce((sum, section) => sum + section.contestants.length, 0) ?? 0;
  });

  protected readonly showPartialCount = computed(() => {
    const total = this.store.filteredCount();
    const shown = this.displayedCount();
    return total > 0 && shown > 0 && shown < total;
  });

  constructor(protected readonly store: ContestantsStore) {}

  protected onGroupModeChange(mode: ContestantGroupMode): void {
    this.store.setGroupMode(mode);
  }

  protected onSortModeChange(mode: ContestantSortMode): void {
    this.store.setSortMode(mode);
  }

  protected onFiltersChange(filters: ContestantFilters): void {
    this.store.setFilters(filters);
  }

  protected onResetAllFilters(): void {
    this.store.resetAllFilters();
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
