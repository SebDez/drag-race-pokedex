import { Component, input, output } from '@angular/core';
import { SortMode, type ContestantSortMode } from '../../../contestants/constants/sort-mode';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contestant-list-sort-by-selector',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="mb-4 text-sm flex flex-col gap-3">
      <label class="text-[var(--color-text)] font-semibold">
        {{ 'sortBy.label' | translate }}
      </label>
      <select
        class="cursor-pointer rounded-full border border-[var(--color-pink)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-pink)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-surface)]"
        [value]="mode()"
        (change)="onChange($event)"
      >
        <option [value]="SortMode.DragNameAsc" [selected]="mode() === SortMode.DragNameAsc">{{ 'sortBy.dragNameAsc' | translate }}</option>
        <option [value]="SortMode.ChallengeWinsDesc" [selected]="mode() === SortMode.ChallengeWinsDesc">{{ 'sortBy.challengeWinsDesc' | translate }}</option>
      </select>
    </div>
  `,
})
export class ContestantListSortBySelectorComponent {
  protected readonly SortMode = SortMode;
  readonly mode = input<ContestantSortMode>(SortMode.DragNameAsc);
  readonly modeChange = output<ContestantSortMode>();

  protected onSelect(mode: ContestantSortMode): void {
    if (mode === this.mode()) return;
    this.modeChange.emit(mode);
  }

  protected onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value as ContestantSortMode | null;
    if (!value) return;
    this.onSelect(value);
  }
}
