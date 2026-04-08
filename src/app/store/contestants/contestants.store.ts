import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { GroupMode, type ContestantGroupMode } from '../../contestants/constants/group-mode';
import type { ContestantSortMode } from '../../contestants/constants/sort-mode';
import { SortMode } from '../../contestants/constants/sort-mode';
import { tap, catchError } from 'rxjs/operators';
import { EMPTY, Subscription } from 'rxjs';
import { DEFAULT_CONTESTANT_FILTERS, type ContestantsViewModel } from './types';
import { ContestantsFetchService } from '../../contestants/contestants-fetch.service';
import { ContestantFilters } from '../../contestants/models/query';
import {
  countLoadedInViewModel,
  mergeContestantsViewModels,
} from '../../contestants/utils/merge-contestants-view-model';

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
  private loadMoreSub: Subscription | null = null;

  private readonly state = signal<{
    viewModel: ContestantsViewModel;
    groupMode: ContestantGroupMode;
    sortMode: ContestantSortMode;
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    filters: ContestantFilters;
    pageSize: number;
    lastFetchedPage: number;
    totalFiltered: number;
  }>({
    viewModel: emptyViewModel,
    groupMode: GroupMode.All,
    sortMode: SortMode.DragNameAsc,
    loading: false,
    loadingMore: false,
    error: null,
    filters: DEFAULT_CONTESTANT_FILTERS,
    pageSize: DEFAULT_PAGE_SIZE,
    lastFetchedPage: 0,
    totalFiltered: 0,
  });

  readonly viewModel = computed<ContestantsViewModel>(() => this.state().viewModel);
  readonly groupMode = computed<ContestantGroupMode>(() => this.state().groupMode);
  readonly sortMode = computed<ContestantSortMode>(() => this.state().sortMode);
  readonly filters = computed<ContestantFilters>(() => this.state().filters);
  readonly pageSize = computed<number>(() => this.state().pageSize);
  readonly totalFiltered = computed<number>(() => this.state().totalFiltered);
  readonly loading = computed<boolean>(() => this.state().loading);
  readonly loadingMore = computed<boolean>(() => this.state().loadingMore);
  readonly error = computed<string | null>(() => this.state().error);
  readonly filteredCount = computed<number>(() => this.state().totalFiltered);

  readonly hasMore = computed<boolean>(() => {
    const s = this.state();
    if (s.loading || s.totalFiltered <= 0) {
      return false;
    }
    return countLoadedInViewModel(s.viewModel) < s.totalFiltered;
  });

  setFilters(filters: ContestantFilters): void {
    this.state.update((s) => ({ ...s, filters }));
    this.reload();
  }

  setGroupMode(mode: ContestantGroupMode): void {
    this.state.update((s) => ({ ...s, groupMode: mode }));
    this.reload();
  }

  setSortMode(mode: ContestantSortMode): void {
    this.state.update((s) => ({ ...s, sortMode: mode }));
    this.reload();
  }

  setPageSize(pageSize: number): void {
    const size = Math.max(1, Math.floor(pageSize));
    this.state.update((s) => ({ ...s, pageSize: size }));
    this.reload();
  }

  loadContestants(): void {
    this.reload();
  }

  loadMore(): void {
    const s = this.state();
    if (s.loading || s.loadingMore || !this.hasMore()) {
      return;
    }

    const nextPage = s.lastFetchedPage + 1;
    this.state.update((prev) => ({ ...prev, loadingMore: true }));

    this.loadMoreSub?.unsubscribe();
    this.loadMoreSub = this.fetchService
      .fetchContestants({
        filters: s.filters,
        sortMode: s.sortMode,
        groupMode: s.groupMode,
        page: nextPage,
        pageSize: s.pageSize,
      })
      .pipe(
        tap((res) => {
          this.state.update((prev) => {
            const merged = mergeContestantsViewModels(prev.viewModel, res.viewModel);
            const before = countLoadedInViewModel(prev.viewModel);
            const after = countLoadedInViewModel(merged);
            if (after <= before) {
              return {
                ...prev,
                loadingMore: false,
                totalFiltered: Math.min(prev.totalFiltered, before),
              };
            }
            return {
              ...prev,
              viewModel: merged,
              totalFiltered: res.totalFiltered,
              lastFetchedPage: nextPage,
              loadingMore: false,
              error: null,
            };
          });
        }),
        catchError(() => {
          this.state.update((prev) => ({ ...prev, loadingMore: false }));
          return EMPTY;
        }),
      )
      .subscribe();
  }

  private reload(): void {
    this.loadSub?.unsubscribe();
    this.loadMoreSub?.unsubscribe();
    this.state.update((s) => ({
      ...s,
      loading: true,
      loadingMore: false,
      error: null,
      lastFetchedPage: 0,
    }));

    const { filters, sortMode, groupMode, pageSize } = this.state();

    this.loadSub = this.fetchService
      .fetchContestants({
        filters,
        sortMode,
        groupMode,
        page: DEFAULT_PAGE,
        pageSize,
      })
      .pipe(
        tap((res) => {
          this.state.update((s) => ({
            ...s,
            viewModel: res.viewModel,
            totalFiltered: res.totalFiltered,
            lastFetchedPage: 1,
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
            lastFetchedPage: 0,
          }));
          return EMPTY;
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
    this.loadMoreSub?.unsubscribe();
  }
}
