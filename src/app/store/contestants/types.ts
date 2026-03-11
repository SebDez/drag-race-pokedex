import { Contestant } from '../../contestants/models/contestant';
import { GroupMode } from '../../contestants/constants/group-mode';

export interface ContestantSectionSeaon {
  franchise: string;
  season: string;
}
export interface ContestantSection {
  key: string;
  contestants: Contestant[];
  season?: ContestantSectionSeaon;
}

export type ContestantsViewModel =
  | { mode: typeof GroupMode.All; list: Contestant[]; sections: null }
  | {
      mode: typeof GroupMode.Alphabetical | typeof GroupMode.Franchise | typeof GroupMode.Seasons;
      list: null;
      sections: ContestantSection[];
    };
