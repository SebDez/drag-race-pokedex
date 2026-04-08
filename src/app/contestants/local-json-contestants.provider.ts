import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ContestantsDataProvider } from './contestants-data-provider';
import { Contestant } from './models/contestant';
import { FRANCHISE_NAMES, SEASONS_PER_FRANCHISE } from './constants/franchises';
import { GroupMode } from './constants/group-mode';
import type { ContestantSortMode } from './constants/sort-mode';
import { SortMode } from './constants/sort-mode';
import type { ContestantFilters, ContestantsQuery } from './models/query';
import type { ContestantsFetchResult } from './models/fetch-results';
import type { ContestantSection, ContestantsViewModel } from '../store/contestants/types';

@Injectable({ providedIn: 'root' })
export class LocalJsonContestantsProvider extends ContestantsDataProvider {
  private readonly dataPath = '/data/contestants_extract.json';
  private cache$: Observable<Contestant[]> | null = null;

  constructor(private http: HttpClient) {
    super();
  }

  override queryContestants(query: ContestantsQuery): Observable<ContestantsFetchResult> {
    return this.getRawContestants$().pipe(map((all) => this.buildResult(all, query)));
  }

  private getRawContestants$(): Observable<Contestant[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<Contestant[]>(this.dataPath).pipe(
        map((data) => (Array.isArray(data) ? data : [])),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.cache$;
  }

  private buildResult(all: Contestant[], query: ContestantsQuery): ContestantsFetchResult {
    const filtered = this.applyFilters(all, query.filters);
    const sorted = this.applySort(filtered, query.sortMode);
    const totalFiltered = sorted.length;

    const page = Math.max(1, query.page);
    const pageSize = Math.max(1, query.pageSize);
    const start = (page - 1) * pageSize;
    const pageSlice = sorted.slice(start, start + pageSize);

    const { groupMode, filters } = query;

    if (groupMode === GroupMode.All) {
      return {
        viewModel: {
          mode: GroupMode.All,
          list: pageSlice,
          sections: null,
        } satisfies ContestantsViewModel,
        totalFiltered,
      };
    }

    if (groupMode === GroupMode.Alphabetical) {
      const sections = this.buildGroupedByLetter(pageSlice);
      return {
        viewModel: {
          mode: GroupMode.Alphabetical,
          list: null,
          sections,
        } satisfies ContestantsViewModel,
        totalFiltered,
      };
    }

    if (groupMode === GroupMode.Franchise) {
      const sections = this.buildGroupedByFranchise(pageSlice, filters);
      return {
        viewModel: {
          mode: GroupMode.Franchise,
          list: null,
          sections,
        } satisfies ContestantsViewModel,
        totalFiltered,
      };
    }

    const sections = this.buildGroupedBySeasons(pageSlice, filters);
    return {
      viewModel: {
        mode: GroupMode.Seasons,
        list: null,
        sections,
      } satisfies ContestantsViewModel,
      totalFiltered,
    };
  }

  private buildGroupedByLetter(sorted: Contestant[]): ContestantSection[] {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return letters
      .map((letter) => ({
        key: letter,
        contestants: sorted.filter((c) => c.dragName?.trim().toUpperCase().startsWith(letter)),
      }))
      .filter((group) => group.contestants.length > 0);
  }

  private buildGroupedByFranchise(
    sorted: Contestant[],
    filters: ContestantFilters,
  ): ContestantSection[] {
    const winnersOnly = filters.winnersOnly;
    return FRANCHISE_NAMES.map((franchise) => ({
      key: franchise,
      contestants: sorted.filter((c) =>
        winnersOnly
          ? c.seasons?.some((s) => s.franchise === franchise && s.isWinner)
          : c.firstFranchise === franchise,
      ),
    })).filter((group) => group.contestants.length > 0);
  }

  private buildGroupedBySeasons(
    sorted: Contestant[],
    filters: ContestantFilters,
  ): ContestantSection[] {
    const sections: ContestantSection[] = [];
    const winnersOnly = filters.winnersOnly;

    for (const franchise of FRANCHISE_NAMES) {
      const totalSeasons = SEASONS_PER_FRANCHISE[franchise] ?? 0;

      for (let seasonNumber = 1; seasonNumber <= totalSeasons; seasonNumber++) {
        const key = `${franchise} (S${seasonNumber})`;
        const contestants = sorted.filter((c) =>
          c.seasons?.some(
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
  }

  private applyFilters(contestants: Contestant[], filters: ContestantFilters): Contestant[] {
    const keys = filters.franchiseSeasonKeys ?? [];
    const search = (filters.searchQuery ?? '').trim().toLowerCase();

    let list = contestants;
    if (search) {
      list = list.filter((c) => (c.dragName?.trim() ?? '').toLowerCase().includes(search));
    }

    if (filters.winnersOnly && keys.length > 0) {
      return list.filter((c) => this.matchesFranchiseSeasonFiltersAndWonInSelection(c, keys));
    }
    if (filters.winnersOnly) {
      return list.filter((c) => c.isWinner);
    }
    if (!keys.length) {
      return list;
    }
    return list.filter((c) => this.matchesFranchiseSeasonFilters(c, keys));
  }

  private applySort(list: Contestant[], sortMode: ContestantSortMode): Contestant[] {
    const copy = [...list];
    if (sortMode === SortMode.DragNameAsc) {
      return copy.sort((a, b) =>
        (a.dragName?.trim() ?? '').localeCompare(b.dragName?.trim() ?? '', undefined, {
          sensitivity: 'base',
        }),
      );
    }
    return copy.sort((a, b) => (b.totalChallengeWins ?? 0) - (a.totalChallengeWins ?? 0));
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

  private matchesFranchiseSeasonFiltersAndWonInSelection(
    contestant: Contestant,
    keys: string[],
  ): boolean {
    const seasons = contestant.seasons ?? [];
    for (const key of keys) {
      const [kind, franchise, seasonNum] = key.split('::');

      if (kind === 'franchise' && franchise) {
        const wonInFranchise = seasons.some((s) => s.franchise === franchise && s.isWinner);
        if (wonInFranchise) return true;
      } else if (kind === 'season' && franchise && seasonNum) {
        const wonThisSeason = seasons.some(
          (s) => s.franchise === franchise && String(s.season) === String(seasonNum) && s.isWinner,
        );
        if (wonThisSeason) return true;
      }
    }
    return false;
  }
}
