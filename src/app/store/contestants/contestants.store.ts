import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { GroupMode, type ContestantGroupMode } from '../../contestants/constants/group-mode';
import type { ContestantSortMode } from '../../contestants/constants/sort-mode';
import { SortMode } from '../../contestants/constants/sort-mode';
import { tap, catchError, exhaustMap, takeUntil, finalize } from 'rxjs/operators';
import { EMPTY, Subject, Subscription } from 'rxjs';
import { DEFAULT_CONTESTANT_FILTERS, type ContestantsViewModel } from './types';
import { ContestantsFetchService } from '../../contestants/contestants-fetch.service';
import { ContestantFilters } from '../../contestants/models/query';
import {
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
  private readonly loadMoreRequests = new Subject<void>();
  private readonly cancelPendingLoadMore = new Subject<void>();
  private loadMorePipelineSub: Subscription | null = null;

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
    if (s.loading || s.loadingMore || s.totalFiltered <= 0) {
      return false;
    }
    return s.lastFetchedPage * s.pageSize < s.totalFiltered;
  });

  constructor() {
    this.loadMorePipelineSub = this.loadMoreRequests
      .pipe(
        exhaustMap(() => {
          const snapshot = this.state();
          if (snapshot.loading || snapshot.loadingMore) {
            return EMPTY;
          }
          if (snapshot.totalFiltered <= 0) {
            return EMPTY;
          }
          if (snapshot.lastFetchedPage * snapshot.pageSize >= snapshot.totalFiltered) {
            return EMPTY;
          }

          const nextPage = snapshot.lastFetchedPage + 1;
          const { filters, sortMode, groupMode, pageSize } = snapshot;

          this.state.update((prev) => ({ ...prev, loadingMore: true }));

          return this.fetchService
            .fetchContestants({
              filters,
              sortMode,
              groupMode,
              page: nextPage,
              pageSize,
            })
            .pipe(
              takeUntil(this.cancelPendingLoadMore),
              tap((res) => {
                this.state.update((prev) => {
                  const merged = mergeContestantsViewModels(prev.viewModel, res.viewModel);
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
              catchError(() => EMPTY),
              finalize(() => {
                this.state.update((prev) =>
                  prev.loadingMore ? { ...prev, loadingMore: false } : prev,
                );
              }),
            );
        }),
      )
      .subscribe();
  }

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

  resetAllFilters(): void {
    this.state.update((s) => ({
      ...s,
      filters: DEFAULT_CONTESTANT_FILTERS,
      groupMode: GroupMode.All,
      sortMode: SortMode.DragNameAsc,
    }));
    this.reload();
  }

  loadContestants(): void {
    this.reload();
  }

  loadMore(): void {
    const s = this.state();
    if (s.loading || s.loadingMore) {
      return;
    }
    if (s.totalFiltered <= 0) {
      return;
    }
    if (s.lastFetchedPage * s.pageSize >= s.totalFiltered) {
      return;
    }
    this.loadMoreRequests.next();
  }

  private reload(): void {
    this.cancelPendingLoadMore.next();
    this.loadSub?.unsubscribe();
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
    this.cancelPendingLoadMore.next();
    this.loadSub?.unsubscribe();
    this.loadMorePipelineSub?.unsubscribe();
  }
}
