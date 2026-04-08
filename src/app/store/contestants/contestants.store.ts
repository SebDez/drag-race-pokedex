import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { GroupMode, type ContestantGroupMode } from '../../contestants/constants/group-mode';
import type { ContestantSortMode } from '../../contestants/constants/sort-mode';
import { SortMode } from '../../contestants/constants/sort-mode';
import { tap, catchError } from 'rxjs/operators';
import { EMPTY, Subscription } from 'rxjs';
import { DEFAULT_CONTESTANT_FILTERS, type ContestantsViewModel } from './types';
import { ContestantsFetchService } from '../../contestants/contestants-fetch.service';
import { ContestantFilters } from '../../contestants/models/query';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 24;

const emptyViewModel: ContestantsViewModel = {
  mode: GroupMode.All,
  list: [],
  sections: null,
};

@Injectable({ providedIn: 'root' })
export class ContestantsStore implements OnDestroy {
  private readonly fetchService = inject(ContestantsFetchService);
  private loadSub: Subscription | null = null;

  private readonly state = signal<{
    viewModel: ContestantsViewModel;
    groupMode: ContestantGroupMode;
    sortMode: ContestantSortMode;
    loading: boolean;
    error: string | null;
    filters: ContestantFilters;
    page: number;
    pageSize: number;
    totalFiltered: number;
  }>({
    viewModel: emptyViewModel,
    groupMode: GroupMode.All,
    sortMode: SortMode.DragNameAsc,
    loading: false,
    error: null,
    filters: DEFAULT_CONTESTANT_FILTERS,
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    totalFiltered: 0,
  });

  readonly viewModel = computed<ContestantsViewModel>(() => this.state().viewModel);
  readonly groupMode = computed<ContestantGroupMode>(() => this.state().groupMode);
  readonly sortMode = computed<ContestantSortMode>(() => this.state().sortMode);
  readonly filters = computed<ContestantFilters>(() => this.state().filters);
  readonly page = computed<number>(() => this.state().page);
  readonly pageSize = computed<number>(() => this.state().pageSize);
  readonly totalFiltered = computed<number>(() => this.state().totalFiltered);
  readonly loading = computed<boolean>(() => this.state().loading);
  readonly error = computed<string | null>(() => this.state().error);
  readonly filteredCount = computed<number>(() => this.state().totalFiltered);

  setFilters(filters: ContestantFilters): void {
    this.state.update((s) => ({ ...s, filters, page: DEFAULT_PAGE }));
    this.reload();
  }

  setGroupMode(mode: ContestantGroupMode): void {
    this.state.update((s) => ({ ...s, groupMode: mode, page: DEFAULT_PAGE }));
    this.reload();
  }

  setSortMode(mode: ContestantSortMode): void {
    this.state.update((s) => ({ ...s, sortMode: mode }));
    this.reload();
  }

  setPage(page: number): void {
    const next = Math.max(1, Math.floor(page));
    this.state.update((s) => ({ ...s, page: next }));
    this.reload();
  }

  setPageSize(pageSize: number): void {
    const size = Math.max(1, Math.floor(pageSize));
    this.state.update((s) => ({ ...s, pageSize: size, page: DEFAULT_PAGE }));
    this.reload();
  }

  loadContestants(): void {
    this.reload();
  }

  private reload(): void {
    this.loadSub?.unsubscribe();
    this.state.update((s) => ({ ...s, loading: true, error: null }));

    const { filters, sortMode, groupMode, page, pageSize } = this.state();

    this.loadSub = this.fetchService
      .fetchContestants({ filters, sortMode, groupMode, page, pageSize })
      .pipe(
        tap((res) => {
          this.state.update((s) => ({
            ...s,
            viewModel: res.viewModel,
            totalFiltered: res.totalFiltered,
            loading: false,
            error: null,
          }));
        }),
        catchError(() => {
          this.state.update((s) => ({
            ...s,
            loading: false,
            error: 'errors.loadFailed',
            viewModel: emptyViewModel,
            totalFiltered: 0,
          }));
          return EMPTY;
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
  }
}
