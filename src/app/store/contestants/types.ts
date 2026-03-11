import { Contestant } from '../../contestants/models/contestant';
import { GroupMode } from '../../contestants/constants/group-mode';

export interface ContestantFilters {
  winnersOnly: boolean;
  /**
   * Keys representing selected franchises and seasons.
   * - Franchise: "franchise::<franchiseName>"
   * - Season: "season::<franchiseName>::<seasonNumber>"
   */
  franchiseSeasonKeys: string[];
  /** Filter by name: display queens whose name contains this string (case insensitive). */
  searchQuery?: string;
}

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
