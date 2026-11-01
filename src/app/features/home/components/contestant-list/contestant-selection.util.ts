import { Contestant } from '@app/core/contestants/models/contestant.model';
import { ContestantSectionSeason } from '@app/core/contestants/models/contestant-view.model';

export function isSameContestantSelection(
  selected: Contestant | null | undefined,
  selectedSeason: ContestantSectionSeason | undefined,
  contestant: Contestant,
  season?: ContestantSectionSeason,
): boolean {
  if (!selected || selected.dragName !== contestant.dragName) {
    return false;
  }
  const a = selectedSeason;
  const b = season;
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.franchise === b.franchise && a.season === b.season;
}
