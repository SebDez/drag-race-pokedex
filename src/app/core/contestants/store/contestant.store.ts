import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import {
  GroupMode,
  type ContestantGroupMode,
} from '@app/core/contestants/constants/group-mode.constants';
import type { ContestantSortMode } from '@app/core/contestants/constants/sort-mode.constants';
import { SortMode } from '@app/core/contestants/constants/sort-mode.constants';
import { tap, catchError, exhaustMap, takeUntil, finalize } from 'rxjs/operators';
import { EMPTY, Subject, Subscription } from 'rxjs';
import {
  DEFAULT_CONTESTANT_FILTERS,
  type ContestantsViewModel,
} from '../models/contestant-view.model';
import { ContestantsService } from '../services/contestant.service';
import { ContestantFilters } from '@app/core/contestants/models/query.model';
import type { ContestantsFetchResult } from '@app/core/contestants/models/fetch-results.model';
import { ContestantsViewModelMerger } from '../utils/contestants-view-model-merger.util';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 24;

const emptyViewModel: ContestantsViewModel = {
  mode: GroupMode.All,
  list: [],
  sections: null,
};

type ContestantsState = {
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
};

@Injectable({ providedIn: 'root' })
export class ContestantsStore implements OnDestroy {
  private loadSub: Subscription | null = null;
  private readonly loadMoreRequests = new Subject<void>();
  private readonly cancelPendingLoadMore = new Subject<void>();
  private loadMorePipelineSub: Subscription | null = null;

  private readonly state = signal<ContestantsState>({
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

  constructor(
    private readonly constestantsService: ContestantsService,
    private readonly viewModelMerger: ContestantsViewModelMerger,
  ) {
    this.initializeLoadMorePipeline();
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

    this.loadSub = this.constestantsService
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

  private initializeLoadMorePipeline(): void {
    this.loadMorePipelineSub = this.loadMoreRequests
      .pipe(exhaustMap(() => this.handleLoadMoreRequest()))
      .subscribe();
  }

  private handleLoadMoreRequest() {
    const snapshot = this.state();
    if (!this.canLoadMoreFromState(snapshot)) {
      return EMPTY;
    }

    const nextPage = snapshot.lastFetchedPage + 1;
    this.setLoadingMoreState(true);

    return this.constestantsService
      .fetchContestants(this.buildLoadMoreQuery(snapshot, nextPage))
      .pipe(
        takeUntil(this.cancelPendingLoadMore),
        tap((res) => this.applyLoadMoreSuccess(nextPage, res)),
        catchError(() => EMPTY),
        finalize(() => this.clearLoadingMoreState()),
      );
  }

  private canLoadMoreFromState(snapshot: ContestantsState): boolean {
    if (snapshot.loading || snapshot.loadingMore) {
      return false;
    }
    if (snapshot.totalFiltered <= 0) {
      return false;
    }
    return snapshot.lastFetchedPage * snapshot.pageSize < snapshot.totalFiltered;
  }

  private buildLoadMoreQuery(snapshot: ContestantsState, nextPage: number) {
    return {
      filters: snapshot.filters,
      sortMode: snapshot.sortMode,
      groupMode: snapshot.groupMode,
      page: nextPage,
      pageSize: snapshot.pageSize,
    };
  }

  private setLoadingMoreState(isLoadingMore: boolean): void {
    this.state.update((prev) => ({ ...prev, loadingMore: isLoadingMore }));
  }

  private clearLoadingMoreState(): void {
    this.state.update((prev) => (prev.loadingMore ? { ...prev, loadingMore: false } : prev));
  }

  private applyLoadMoreSuccess(nextPage: number, result: ContestantsFetchResult): void {
    this.state.update((prev) => {
      const merged = this.viewModelMerger.merge(prev.viewModel, result.viewModel);
      return {
        ...prev,
        viewModel: merged,
        totalFiltered: result.totalFiltered,
        lastFetchedPage: nextPage,
        loadingMore: false,
        error: null,
      };
    });
  }

  ngOnDestroy(): void {
    this.cancelPendingLoadMore.next();
    this.loadSub?.unsubscribe();
    this.loadMorePipelineSub?.unsubscribe();
  }
}
