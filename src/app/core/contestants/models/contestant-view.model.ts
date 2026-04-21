import { Contestant } from '@app/core/contestants/models/contestant.model';
import { GroupMode } from '@app/core/contestants/constants/group-mode.constants';
import type { ContestantFilters } from '@app/core/contestants/models/query.model';

export type { ContestantFilters } from '@app/core/contestants/models/query.model';

export const DEFAULT_CONTESTANT_FILTERS: ContestantFilters = {
  winnersOnly: false,
  franchiseSeasonKeys: [],
  searchQuery: '',
};

export interface ContestantSectionSeason {
  franchise: string;
  season: string;
}
export interface ContestantSection {
  key: string;
  contestants: Contestant[];
  season?: ContestantSectionSeason;
}

export type ContestantsViewModel =
  | { mode: typeof GroupMode.All; list: Contestant[]; sections: null }
  | {
      mode: typeof GroupMode.Alphabetical | typeof GroupMode.Franchise | typeof GroupMode.Seasons;
      list: null;
      sections: ContestantSection[];
    };
