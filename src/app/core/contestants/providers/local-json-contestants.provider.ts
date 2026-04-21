import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ContestantsDataProvider } from './contestants.provider';
import { Contestant } from '../models/contestant.model';
import { FRANCHISE_NAMES, SEASONS_PER_FRANCHISE } from '../constants/franchises.constants';
import { GroupMode, type ContestantGroupMode } from '../constants/group-mode.constants';
import type { ContestantSortMode } from '../constants/sort-mode.constants';
import { SortMode } from '../constants/sort-mode.constants';
import type { ContestantFilters, ContestantsQuery } from '../models/query.model';
import type { ContestantsFetchResult } from '../models/fetch-results.model';
import type {
  ContestantSection,
  ContestantsViewModel,
} from '@app/core/contestants/models/contestant-view.model';

interface SeasonPageEntry {
  contestant: Contestant;
  franchise: string;
  season: string;
}

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
    const { groupMode, filters, sortMode } = query;

    const page = Math.max(1, query.page);
    const pageSize = Math.max(1, query.pageSize);
    const start = (page - 1) * pageSize;

    if (groupMode === GroupMode.All) {
      const sorted = this.applySort(filtered, sortMode);
      const totalFiltered = sorted.length;
      const pageSlice = sorted.slice(start, start + pageSize);
      return {
        viewModel: {
          mode: GroupMode.All,
          list: pageSlice,
          sections: null,
        } satisfies ContestantsViewModel,
        totalFiltered,
      };
    }

    if (groupMode === GroupMode.Seasons) {
      const orderedEntries = this.flattenSeasonEntriesForPagination(filtered, sortMode, filters);
      const totalFiltered = orderedEntries.length;
      const pageEntries = orderedEntries.slice(start, start + pageSize);
      const sections = this.dedupeSectionContestants(this.buildGroupedBySeasonEntries(pageEntries));
      return {
        viewModel: {
          mode: GroupMode.Seasons,
          list: null,
          sections,
        } satisfies ContestantsViewModel,
        totalFiltered,
      };
    }

    const ordered = this.flattenForGroupedPagination(filtered, sortMode, groupMode, filters);
    const totalFiltered = ordered.length;
    const pageSlice = ordered.slice(start, start + pageSize);

    if (groupMode === GroupMode.Alphabetical) {
      const sections = this.dedupeSectionContestants(this.buildGroupedByLetter(pageSlice));
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
      const sections = this.dedupeSectionContestants(
        this.buildGroupedByFranchise(pageSlice, filters),
      );
      return {
        viewModel: {
          mode: GroupMode.Franchise,
          list: null,
          sections,
        } satisfies ContestantsViewModel,
        totalFiltered,
      };
    }

    const sections = this.dedupeSectionContestants(this.buildGroupedBySeasons(pageSlice, filters));
    return {
      viewModel: {
        mode: GroupMode.Seasons,
        list: null,
        sections,
      } satisfies ContestantsViewModel,
      totalFiltered,
    };
  }

  private flattenForGroupedPagination(
    filtered: Contestant[],
    sortMode: ContestantSortMode,
    groupMode: Exclude<ContestantGroupMode, typeof GroupMode.All>,
    filters: ContestantFilters,
  ): Contestant[] {
    if (groupMode === GroupMode.Alphabetical) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const out: Contestant[] = [];
      for (const letter of letters) {
        const perLetter = filtered.filter((c) =>
          c.dragName?.trim().toUpperCase().startsWith(letter),
        );
        out.push(...this.applySort(perLetter, sortMode));
      }
      return out;
    }

    if (groupMode === GroupMode.Franchise) {
      const winnersOnly = filters.winnersOnly;
      const out: Contestant[] = [];
      const seen = winnersOnly ? new Set<string>() : null;
      for (const franchise of FRANCHISE_NAMES) {
        const perFranchise = filtered.filter((c) =>
          winnersOnly
            ? c.seasons?.some((s) => s.franchise === franchise && s.isWinner)
            : c.firstFranchise === franchise,
        );
        for (const c of this.applySort(perFranchise, sortMode)) {
          if (seen) {
            const id = this.contestantIdentityKey(c);
            if (seen.has(id)) {
              continue;
            }
            seen.add(id);
          }
          out.push(c);
        }
      }
      return out;
    }

    if (groupMode === GroupMode.Seasons) {
      return this.flattenSeasonEntriesForPagination(filtered, sortMode, filters).map(
        (entry) => entry.contestant,
      );
    }

    return [];
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
    if (!winnersOnly) {
      return FRANCHISE_NAMES.map((franchise) => ({
        key: franchise,
        contestants: sorted.filter((c) => c.firstFranchise === franchise),
      })).filter((group) => group.contestants.length > 0);
    }

    const seen = new Set<string>();
    return FRANCHISE_NAMES.map((franchise) => ({
      key: franchise,
      contestants: sorted.filter((c) => {
        const wonHere = c.seasons?.some((s) => s.franchise === franchise && s.isWinner);
        if (!wonHere) {
          return false;
        }
        const id = this.contestantIdentityKey(c);
        if (seen.has(id)) {
          return false;
        }
        seen.add(id);
        return true;
      }),
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

  private flattenSeasonEntriesForPagination(
    filtered: Contestant[],
    sortMode: ContestantSortMode,
    filters: ContestantFilters,
  ): SeasonPageEntry[] {
    const out: SeasonPageEntry[] = [];
    const winnersOnly = filters.winnersOnly;

    for (const franchise of FRANCHISE_NAMES) {
      const totalSeasons = SEASONS_PER_FRANCHISE[franchise] ?? 0;
      for (let seasonNumber = 1; seasonNumber <= totalSeasons; seasonNumber++) {
        const season = String(seasonNumber);
        const perSeason = filtered.filter((c) =>
          c.seasons?.some(
            (s) => s.franchise === franchise && s.season === season && (!winnersOnly || s.isWinner),
          ),
        );
        for (const contestant of this.applySort(perSeason, sortMode)) {
          out.push({ contestant, franchise, season });
        }
      }
    }

    return out;
  }

  private buildGroupedBySeasonEntries(entries: SeasonPageEntry[]): ContestantSection[] {
    const sections: ContestantSection[] = [];

    for (const franchise of FRANCHISE_NAMES) {
      const totalSeasons = SEASONS_PER_FRANCHISE[franchise] ?? 0;
      for (let seasonNumber = 1; seasonNumber <= totalSeasons; seasonNumber++) {
        const season = String(seasonNumber);
        const key = `${franchise} (S${seasonNumber})`;
        const contestants = entries
          .filter((entry) => entry.franchise === franchise && entry.season === season)
          .map((entry) => entry.contestant);

        if (contestants.length > 0) {
          sections.push({ key, contestants, season: { franchise, season } });
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

  private contestantIdentityKey(c: Contestant): string {
    const url = (c.wikiUrl ?? '').trim();
    if (url.length > 0) {
      return url;
    }
    return (c.dragName ?? '').trim().toLowerCase();
  }

  private dedupeSectionContestants(sections: ContestantSection[]): ContestantSection[] {
    return sections.map((section) => {
      const seen = new Set<string>();
      const uniqueContestants: Contestant[] = [];

      for (const contestant of section.contestants) {
        const id = this.contestantIdentityKey(contestant);
        if (seen.has(id)) {
          continue;
        }
        seen.add(id);
        uniqueContestants.push(contestant);
      }

      return {
        ...section,
        contestants: uniqueContestants,
      };
    });
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
