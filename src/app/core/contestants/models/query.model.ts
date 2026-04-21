import { ContestantGroupMode } from '@app/core/contestants/constants/group-mode.constants';
import { ContestantSortMode } from '@app/core/contestants/constants/sort-mode.constants';

export interface ContestantFilters {
  winnersOnly: boolean;
  franchiseSeasonKeys: string[];
  searchQuery?: string;
}

export interface ContestantsQuery {
  filters: ContestantFilters;
  sortMode: ContestantSortMode;
  groupMode: ContestantGroupMode;
  page: number;
  pageSize: number;
}
