import { FRANCHISE_NAMES, SEASONS_PER_FRANCHISE } from '../constants/franchises';
import { GroupMode } from '../constants/group-mode';
import type { ContestantSection, ContestantsViewModel } from '../../store/contestants/types';

export function countLoadedInViewModel(vm: ContestantsViewModel): number {
  if (vm.mode === GroupMode.All) {
    return vm.list.length;
  }
  return vm.sections.reduce((acc, s) => acc + s.contestants.length, 0);
}

/**
 * Concatenate a loaded page to the already displayed view (infinite scroll).
 */
export function mergeContestantsViewModels(
  previous: ContestantsViewModel,
  incoming: ContestantsViewModel,
): ContestantsViewModel {
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
    return buildMergedAlphabetical(previous.sections, incoming.sections);
  }

  if (previous.mode === GroupMode.Franchise && incoming.mode === GroupMode.Franchise) {
    return buildMergedFranchise(previous.sections, incoming.sections);
  }

  if (previous.mode === GroupMode.Seasons && incoming.mode === GroupMode.Seasons) {
    return buildMergedSeasons(previous.sections, incoming.sections);
  }

  return incoming;
}

function buildMergedAlphabetical(
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

function buildMergedFranchise(
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

function buildMergedSeasons(
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
