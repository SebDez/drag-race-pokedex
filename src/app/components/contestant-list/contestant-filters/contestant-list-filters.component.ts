import { Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ContestantListGroupBySelectorComponent } from './contestant-list-group-by-selector.component';
import { ContestantListSortBySelectorComponent } from './contestant-list-sort-by-selector.component';
import { ContestantListSearchBarComponent } from './contestant-list-search-bar.component';
import { GroupMode, type ContestantGroupMode } from '../../../contestants/constants/group-mode';
import { SortMode, type ContestantSortMode } from '../../../contestants/constants/sort-mode';
import { ContestantListAdvancedFiltersComponent } from './contestant-list-advanced-filters.component';
import { DEFAULT_CONTESTANT_FILTERS } from '../../../store/contestants/types';
import { ContestantFilters } from '../../../contestants/models/query';

@Component({
  selector: 'app-contestant-list-filters',
  standalone: true,
  imports: [
    TranslateModule,
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
        (resetAllFilters)="onResetAllFromAdvanced()"
      />
      <app-contestant-list-search-bar
        class="col-span-3"
        [value]="filters().searchQuery ?? ''"
        (valueChange)="onSearchChange($event)"
      />
      <div class="col-span-3 flex justify-end">
        <button
          type="button"
          data-testid="reset-all-filters-toolbar"
          class="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-pink)] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-pink)] rounded px-1 disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
          [disabled]="isDefaultState()"
          (click)="onResetAllClick()"
          [attr.aria-label]="'filters.resetAll' | translate"
        >
          {{ 'filters.resetAll' | translate }}
        </button>
      </div>
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
  readonly resetAllFilters = output<void>();

  protected isDefaultState(): boolean {
    const f = this.filters();
    const search = (f.searchQuery ?? '').trim();
    return (
      this.groupMode() === GroupMode.All &&
      this.sortMode() === SortMode.DragNameAsc &&
      !f.winnersOnly &&
      (f.franchiseSeasonKeys?.length ?? 0) === 0 &&
      search === ''
    );
  }

  protected onResetAllClick(): void {
    this.resetAllFilters.emit();
  }

  protected onResetAllFromAdvanced(): void {
    this.resetAllFilters.emit();
  }

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
