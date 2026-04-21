import { Injectable } from '@angular/core';
import {
  FRANCHISE_NAMES,
  SEASONS_PER_FRANCHISE,
} from '@app/core/contestants/constants/franchises.constants';
import { GroupMode } from '@app/core/contestants/constants/group-mode.constants';
import type {
  ContestantSection,
  ContestantsViewModel,
} from '@app/core/contestants/models/contestant-view.model';

@Injectable({ providedIn: 'root' })
export class ContestantsViewModelMerger {
  countLoadedInViewModel(vm: ContestantsViewModel): number {
    if (vm.mode === GroupMode.All) {
      return vm.list.length;
    }

    return vm.sections.reduce((acc, s) => acc + s.contestants.length, 0);
  }

  merge(previous: ContestantsViewModel, incoming: ContestantsViewModel): ContestantsViewModel {
    if (previous.mode !== incoming.mode) {
      return incoming;
    }

    if (previous.mode === GroupMode.All && incoming.mode === GroupMode.All) {
      return {
        mode: GroupMode.All,
        list: [...previous.list, ...incoming.list],
        sections: null,
      };
    }

    if (previous.mode === GroupMode.Alphabetical && incoming.mode === GroupMode.Alphabetical) {
      return this.buildMergedAlphabetical(previous.sections, incoming.sections);
    }

    if (previous.mode === GroupMode.Franchise && incoming.mode === GroupMode.Franchise) {
      return this.buildMergedFranchise(previous.sections, incoming.sections);
    }

    if (previous.mode === GroupMode.Seasons && incoming.mode === GroupMode.Seasons) {
      return this.buildMergedSeasons(previous.sections, incoming.sections);
    }

    return incoming;
  }

  private buildMergedAlphabetical(
    previous: ContestantSection[],
    incoming: ContestantSection[],
  ): ContestantsViewModel {
    const map = new Map<string, ContestantSection>();
    const add = (sections: ContestantSection[]): void => {
      for (const sec of sections) {
        const existing = map.get(sec.key);
        if (existing) {
          existing.contestants = [...existing.contestants, ...sec.contestants];
        } else {
          map.set(sec.key, {
            key: sec.key,
            contestants: [...sec.contestants],
          });
        }
      }
    };

    add(previous);
    add(incoming);

    const keys = [...map.keys()].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' }),
    );

    return {
      mode: GroupMode.Alphabetical,
      list: null,
      sections: keys.map((k) => map.get(k)!),
    };
  }

  private buildMergedFranchise(
    previous: ContestantSection[],
    incoming: ContestantSection[],
  ): ContestantsViewModel {
    const map = new Map<string, ContestantSection>();
    const add = (sections: ContestantSection[]): void => {
      for (const sec of sections) {
        const existing = map.get(sec.key);
        if (existing) {
          existing.contestants = [...existing.contestants, ...sec.contestants];
        } else {
          map.set(sec.key, {
            key: sec.key,
            contestants: [...sec.contestants],
          });
        }
      }
    };

    add(previous);
    add(incoming);

    const sections = FRANCHISE_NAMES.map((name) => map.get(name)).filter(
      (s): s is ContestantSection => s !== undefined && s.contestants.length > 0,
    );

    return {
      mode: GroupMode.Franchise,
      list: null,
      sections,
    };
  }

  private buildMergedSeasons(
    previous: ContestantSection[],
    incoming: ContestantSection[],
  ): ContestantsViewModel {
    const map = new Map<string, ContestantSection>();
    const add = (sections: ContestantSection[]): void => {
      for (const sec of sections) {
        const existing = map.get(sec.key);
        if (existing) {
          existing.contestants = this.dedupeContestants([
            ...existing.contestants,
            ...sec.contestants,
          ]);
        } else {
          map.set(sec.key, {
            key: sec.key,
            contestants: this.dedupeContestants([...sec.contestants]),
            ...(sec.season !== undefined ? { season: sec.season } : {}),
          });
        }
      }
    };

    add(previous);
    add(incoming);

    const sections: ContestantSection[] = [];
    for (const franchise of FRANCHISE_NAMES) {
      const totalSeasons = SEASONS_PER_FRANCHISE[franchise] ?? 0;
      for (let seasonNumber = 1; seasonNumber <= totalSeasons; seasonNumber++) {
        const key = `${franchise} (S${seasonNumber})`;
        const sec = map.get(key);
        if (sec && sec.contestants.length > 0) {
          sections.push(sec);
        }
      }
    }

    return {
      mode: GroupMode.Seasons,
      list: null,
      sections,
    };
  }

  private dedupeContestants(
    contestants: ContestantSection['contestants'],
  ): ContestantSection['contestants'] {
    const seen = new Set<string>();
    const unique: ContestantSection['contestants'] = [];

    for (const contestant of contestants) {
      const id = this.contestantKey(contestant);
      if (seen.has(id)) {
        continue;
      }

      seen.add(id);
      unique.push(contestant);
    }

    return unique;
  }

  private contestantKey(contestant: ContestantSection['contestants'][number]): string {
    const url = (contestant.wikiUrl ?? '').trim();
    if (url.length > 0) {
      return url;
    }

    return (contestant.dragName ?? '').trim().toLowerCase();
  }
}
