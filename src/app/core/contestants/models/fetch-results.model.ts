import { ContestantsViewModel } from '@app/core/contestants/models/contestant-view.model';

export interface ContestantsFetchResult {
  viewModel: ContestantsViewModel;
  totalFiltered: number;
}
