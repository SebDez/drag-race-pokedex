import { Component, input, output } from '@angular/core';
import { ContestantListGroupBySelectorComponent } from './contestant-list-group-by-selector.component';
import { GroupMode, type ContestantGroupMode } from '../../../contestants/constants/group-mode';

@Component({
  selector: 'app-contestant-list-filters',
  standalone: true,
  imports: [ContestantListGroupBySelectorComponent],
  template: `
    <div class="grid grid-cols-3 gap-2 bg-[var(--color-pink)]/10 rounded-lg p-2 mb-2">
      <app-contestant-list-group-by-selector
        class="col-span-1"
        [mode]="mode()"
        (modeChange)="onGroupModeChange($event)"
      />
    </div>
  `,
})
export class ContestantListFiltersComponent {
  readonly mode = input<ContestantGroupMode>(GroupMode.All);
  readonly modeChange = output<ContestantGroupMode>();

  protected onGroupModeChange(mode: ContestantGroupMode): void {
    this.modeChange.emit(mode);
  }
}
