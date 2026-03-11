import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { CONTESTANTS_DATA_PROVIDER } from '../../contestants/contestants-data-provider';
import { Contestant } from '../../contestants/models/contestant';
import { FRANCHISE_NAMES, SEASONS_PER_FRANCHISE } from '../../contestants/constants/franchises';
import { GroupMode, type ContestantGroupMode } from '../../contestants/constants/group-mode';
import { SortMode, type ContestantSortMode } from '../../contestants/constants/sort-mode';
import { tap, catchError } from 'rxjs/operators';
import { of, type Subscription } from 'rxjs';
import { type ContestantFilters, ContestantSection, ContestantsViewModel } from './types';

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
    filters: ContestantFilters;
  }>({
    contestants: [],
    groupMode: GroupMode.All,
    sortMode: SortMode.DragNameAsc,
    loading: false,
    error: null,
    filters: {
      winnersOnly: false,
      franchiseSeasonKeys: [],
    },
  });

  readonly contestants = computed<Contestant[]>(() => this.state().contestants);
  readonly groupMode = computed<ContestantGroupMode>(() => this.state().groupMode);
  readonly sortMode = computed<ContestantSortMode>(() => this.state().sortMode);
  readonly filters = computed<ContestantFilters>(() => this.state().filters);

  private readonly filteredContestants = computed<Contestant[]>(() => {
    const { contestants, filters } = this.state();
    const keys = filters.franchiseSeasonKeys ?? [];

    if (filters.winnersOnly && keys.length > 0) {
      return contestants.filter((c) =>
        this.matchesFranchiseSeasonFiltersAndWonInSelection(c, keys),
      );
    }
    if (filters.winnersOnly) {
      return contestants.filter((c) => c.isWinner);
    }
    if (!keys.length) {
      return contestants;
    }
    return contestants.filter((c) => this.matchesFranchiseSeasonFilters(c, keys));
  });

  private readonly sortedContestants = computed<Contestant[]>(() => {
    const list = this.filteredContestants();
    const mode = this.sortMode();
    const copy = [...list];
    if (mode === SortMode.DragNameAsc) {
      return copy.sort((a, b) =>
        (a.dragName?.trim() ?? '').localeCompare(b.dragName?.trim() ?? '', undefined, {
          sensitivity: 'base',
        }),
      );
    }
    return copy.sort((a, b) => (b.totalChallengeWins ?? 0) - (a.totalChallengeWins ?? 0));
  });
  readonly loading = computed<boolean>(() => this.state().loading);
  readonly error = computed<string | null>(() => this.state().error);
  readonly count = computed<number>(() => this.state().contestants.length);

  private readonly groupedByLetter = computed<ContestantSection[]>(() => {
    const all = this.sortedContestants();
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return letters
      .map((letter) => ({
        key: letter,
        contestants: all.filter((c) => c.dragName?.trim().toUpperCase().startsWith(letter)),
      }))
      .filter((group) => group.contestants.length > 0);
  });

  private readonly groupedByFranchise = computed<ContestantSection[]>(() => {
    const all = this.sortedContestants();
    const winnersOnly = this.filters().winnersOnly;
    return FRANCHISE_NAMES.map((franchise) => ({
      key: franchise,
      contestants: all.filter((c) =>
        winnersOnly
          ? c.seasons?.some((s) => s.franchise === franchise && s.isWinner)
          : c.firstFranchise === franchise,
      ),
    })).filter((group) => group.contestants.length > 0);
  });

  private readonly groupedBySeasons = computed<ContestantSection[]>(() => {
    const all = this.sortedContestants();
    const sections: ContestantSection[] = [];
    const winnersOnly = this.filters().winnersOnly;

    for (const franchise of FRANCHISE_NAMES) {
      const totalSeasons = SEASONS_PER_FRANCHISE[franchise] ?? 0;

      for (let seasonNumber = 1; seasonNumber <= totalSeasons; seasonNumber++) {
        const key = `${franchise} (S${seasonNumber})`;
        const contestants = all.filter((c) =>
          c.seasons.some(
            (s) =>
              s.franchise === franchise &&
              s.season === String(seasonNumber) &&
              (!winnersOnly || s.isWinner),
          ),
        );

        if (contestants.length > 0) {
          sections.push({ key, contestants, season: { franchise, season: String(seasonNumber) } });
        }
      }
    }

    return sections;
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
    if (mode === GroupMode.Franchise) {
      return { mode: GroupMode.Franchise, list: null, sections: this.groupedByFranchise() };
    }
    if (mode === GroupMode.Seasons) {
      return {
        mode: GroupMode.Seasons,
        list: null,
        sections: this.groupedBySeasons(),
      };
    }
    return { mode: GroupMode.All, list, sections: null };
  });

  setFilters(filters: ContestantFilters): void {
    this.state.update((s) => ({ ...s, filters }));
  }

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

  private matchesFranchiseSeasonFilters(contestant: Contestant, keys: string[]): boolean {
    for (const key of keys) {
      const [kind, franchise, season] = key.split('::');

      if (kind === 'franchise' && franchise) {
        if (contestant.firstFranchise === franchise) {
          return true;
        }
      } else if (kind === 'season' && franchise && season) {
        if (
          contestant.seasons?.some(
            (s) => s.franchise === franchise && String(s.season) === String(season),
          )
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * True if the contestant has won in at least one of the selected franchise/season
   * (i.e. has a season matching a key with season.isWinner === true).
   */
  private matchesFranchiseSeasonFiltersAndWonInSelection(
    contestant: Contestant,
    keys: string[],
  ): boolean {
    const seasons = contestant.seasons ?? [];
    for (const key of keys) {
      const [kind, franchise, seasonNum] = key.split('::');

      if (kind === 'franchise' && franchise) {
        const wonInFranchise = seasons.some(
          (s) => s.franchise === franchise && s.isWinner,
        );
        if (wonInFranchise) return true;
      } else if (kind === 'season' && franchise && seasonNum) {
        const wonThisSeason = seasons.some(
          (s) =>
            s.franchise === franchise &&
            String(s.season) === String(seasonNum) &&
            s.isWinner,
        );
        if (wonThisSeason) return true;
      }
    }
    return false;
  }
}
