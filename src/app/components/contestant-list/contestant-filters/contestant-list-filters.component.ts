import { Component, input, output } from '@angular/core';
import { ContestantListGroupBySelectorComponent } from './contestant-list-group-by-selector.component';
import { ContestantListSortBySelectorComponent } from './contestant-list-sort-by-selector.component';
import { ContestantListSearchBarComponent } from './contestant-list-search-bar.component';
import { GroupMode, type ContestantGroupMode } from '../../../contestants/constants/group-mode';
import { SortMode, type ContestantSortMode } from '../../../contestants/constants/sort-mode';
import { ContestantListAdvancedFiltersComponent } from './contestant-list-advanced-filters.component';
import { DEFAULT_CONTESTANT_FILTERS, type ContestantFilters } from '../../../store/contestants/types';

@Component({
  selector: 'app-contestant-list-filters',
  standalone: true,
  imports: [
    ContestantListSearchBarComponent,
    ContestantListGroupBySelectorComponent,
    ContestantListSortBySelectorComponent,
    ContestantListAdvancedFiltersComponent,
  ],
  template: `
    <div class="grid grid-cols-3 gap-2 bg-[var(--color-pink)]/10 rounded-lg p-2 mb-2">
      <app-contestant-list-group-by-selector
        class="col-span-1"
        [mode]="groupMode()"
        (modeChange)="onGroupModeChange($event)"
      />
      <app-contestant-list-sort-by-selector
        class="col-span-1"
        [mode]="sortMode()"
        (modeChange)="onSortModeChange($event)"
      />
      <app-contestant-list-advanced-filters
        class="col-span-1"
        [filters]="filters()"
        (filtersChange)="onFiltersChange($event)"
      />
      <app-contestant-list-search-bar
        class="col-span-3"
        [value]="filters().searchQuery ?? ''"
        (valueChange)="onSearchChange($event)"
      />
    </div>
  `,
})
export class ContestantListFiltersComponent {
  readonly groupMode = input<ContestantGroupMode>(GroupMode.All);
  readonly groupModeChange = output<ContestantGroupMode>();
  readonly sortMode = input<ContestantSortMode>(SortMode.DragNameAsc);
  readonly sortModeChange = output<ContestantSortMode>();
  readonly filters = input<ContestantFilters>(DEFAULT_CONTESTANT_FILTERS);
  readonly filtersChange = output<ContestantFilters>();

  protected onSearchChange(query: string): void {
    const current = this.filters();
    this.filtersChange.emit({ ...current, searchQuery: query });
  }

  protected onGroupModeChange(mode: ContestantGroupMode): void {
    this.groupModeChange.emit(mode);
  }

  protected onSortModeChange(mode: ContestantSortMode): void {
    this.sortModeChange.emit(mode);
  }

  protected onFiltersChange(filters: ContestantFilters): void {
    this.filtersChange.emit(filters);
  }
}
