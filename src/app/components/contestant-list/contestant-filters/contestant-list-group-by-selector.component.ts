import { Component, input, output } from '@angular/core';
import { GroupMode, type ContestantGroupMode } from '../../../contestants/constants/group-mode';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contestant-list-group-by-selector',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="mb-4 text-sm flex flex-col gap-3">
      <label class="text-(--color-text) font-semibold">
        {{ 'groupBy.label' | translate }}
      </label>
      <select
        class="cursor-pointer rounded-full border border-(--color-pink) bg-(--color-surface-elevated) px-3 py-1.5 text-(--color-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-pink) focus-visible:ring-offset-1 focus-visible:ring-offset-(--color-surface)"
        [value]="mode()"
        (change)="onChange($event)"
      >
        <option [value]="GroupMode.All" [selected]="mode() === GroupMode.All">
          {{ 'groupBy.all' | translate }}
        </option>
        <option [value]="GroupMode.Alphabetical" [selected]="mode() === GroupMode.Alphabetical">
          {{ 'groupBy.alphabetical' | translate }}
        </option>
        <option [value]="GroupMode.Franchise" [selected]="mode() === GroupMode.Franchise">
          {{ 'groupBy.franchise' | translate }}
        </option>
        <option [value]="GroupMode.Seasons" [selected]="mode() === GroupMode.Seasons">
          {{ 'groupBy.franchiseAndSeasons' | translate }}
        </option>
      </select>
    </div>
  `,
})
export class ContestantListGroupBySelectorComponent {
  protected readonly GroupMode = GroupMode;
  readonly mode = input<ContestantGroupMode>(GroupMode.All);
  readonly modeChange = output<ContestantGroupMode>();

  protected onSelect(mode: ContestantGroupMode): void {
    if (mode === this.mode()) return;
    this.modeChange.emit(mode);
  }

  protected onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value as ContestantGroupMode | null;
    if (!value) return;
    this.onSelect(value);
  }
}
