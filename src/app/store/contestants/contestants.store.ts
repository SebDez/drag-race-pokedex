import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { CONTESTANTS_DATA_PROVIDER } from '../../contestants/contestants-data-provider';
import { Contestant } from '../../contestants/models/contestant';
import { FRANCHISE_NAMES } from '../../contestants/constants/franchises';
import { GroupMode, type ContestantGroupMode } from '../../contestants/constants/group-mode';
import { SortMode, type ContestantSortMode } from '../../contestants/constants/sort-mode';
import { tap, catchError } from 'rxjs/operators';
import { of, type Subscription } from 'rxjs';
import { ContestantsViewModel } from './types';

@Injectable({ providedIn: 'root' })
export class ContestantsStore implements OnDestroy {
  private readonly provider = inject(CONTESTANTS_DATA_PROVIDER);
  private loadSub: Subscription | null = null;

  private readonly state = signal<{
    contestants: Contestant[];
    groupMode: ContestantGroupMode;
    sortMode: ContestantSortMode;
    loading: boolean;
    error: string | null;
  }>({
    contestants: [],
    groupMode: GroupMode.All,
    sortMode: SortMode.DragNameAsc,
    loading: false,
    error: null,
  });

  readonly contestants = computed(() => this.state().contestants);
  readonly groupMode = computed(() => this.state().groupMode);
  readonly sortMode = computed(() => this.state().sortMode);

  private readonly sortedContestants = computed(() => {
    const list = this.contestants();
    const mode = this.sortMode();
    const copy = [...list];
    if (mode === SortMode.DragNameAsc) {
      return copy.sort((a, b) =>
        (a.dragName?.trim() ?? '').localeCompare(b.dragName?.trim() ?? '', undefined, { sensitivity: 'base' })
      );
    }
    return copy.sort((a, b) => (b.totalChallengeWins ?? 0) - (a.totalChallengeWins ?? 0));
  });
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly count = computed(() => this.state().contestants.length);

  private readonly groupedByLetter = computed(() => {
    const all = this.sortedContestants();
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return letters
      .map((letter) => ({
        key: letter,
        contestants: all.filter((c) => c.dragName?.trim().toUpperCase().startsWith(letter)),
      }))
      .filter((group) => group.contestants.length > 0);
  });

  private readonly groupedByFranchise = computed(() => {
    const all = this.sortedContestants();
    return FRANCHISE_NAMES.map((franchise) => ({
      key: franchise,
      contestants: all.filter((c) => c.firstFranchise === franchise),
    })).filter((group) => group.contestants.length > 0);
  });

  readonly viewModel = computed<ContestantsViewModel>(() => {
    const mode = this.groupMode();
    const list = this.sortedContestants();
    if (mode === GroupMode.All) {
      return { mode: GroupMode.All, list, sections: null };
    }
    if (mode === GroupMode.Alphabetical) {
      return { mode: GroupMode.Alphabetical, list: null, sections: this.groupedByLetter() };
    }
    return { mode: GroupMode.Franchise, list: null, sections: this.groupedByFranchise() };
  });

  setGroupMode(mode: ContestantGroupMode): void {
    this.state.update((s) => ({ ...s, groupMode: mode }));
  }

  setSortMode(mode: ContestantSortMode): void {
    this.state.update((s) => ({ ...s, sortMode: mode }));
  }

  loadContestants(): void {
    this.loadSub?.unsubscribe();
    this.state.update((s) => ({ ...s, loading: true, error: null }));

    this.loadSub = this.provider
      .getContestants()
      .pipe(
        tap((contestants) => {
          this.state.update((s) => ({
            ...s,
            contestants,
            loading: false,
            error: null,
          }));
        }),
        catchError(() => {
          this.state.update((s) => ({
            ...s,
            loading: false,
            error: 'errors.loadFailed',
          }));
          return of([]);
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
  }
}
