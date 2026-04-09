import { ContestantGroupMode } from '../constants/group-mode';
import { ContestantSortMode } from '../constants/sort-mode';

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

export interface ContestantsQuery {
  filters: ContestantFilters;
  sortMode: ContestantSortMode;
  groupMode: ContestantGroupMode;
  page: number;
  pageSize: number;
}
