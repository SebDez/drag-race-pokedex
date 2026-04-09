import { ContestantsViewModel } from '../../store/contestants/types';

export interface ContestantsFetchResult {
  viewModel: ContestantsViewModel;
  totalFiltered: number;
}
