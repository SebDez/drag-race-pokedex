import { Component, input, signal } from '@angular/core';
import { Contestant } from '../../contestants/models/contestant';
import { ContestantCardComponent } from './contestant-card/contestant-card.component';
import { ContestantDetailComponent } from './contestant-detail/contestant-detail.component';

@Component({
  selector: 'app-contestant-list',
  standalone: true,
  imports: [ContestantCardComponent, ContestantDetailComponent],
  templateUrl: './contestant-list.component.html',
})
export class ContestantListComponent {
  readonly contestants = input.required<Contestant[]>();

  protected readonly expandedDragName = signal<string | null>(null);
  private readonly closingDragName = signal<string | null>(null);
  private closingTimeout: ReturnType<typeof setTimeout> | null = null;

  protected readonly isExpanded = (dragName: string) => this.expandedDragName() === dragName;
  protected readonly isDetailVisible = (dragName: string) =>
    this.expandedDragName() === dragName || this.closingDragName() === dragName;
  protected readonly isDetailClosing = (dragName: string) => this.closingDragName() === dragName;

  protected trackByDragName(_index: number, contestant: Contestant): string {
    return contestant.dragName;
  }

  protected toggleExpand(contestant: Contestant): void {
    const current = this.expandedDragName();
    if (current === contestant.dragName) {
      this.closingDragName.set(contestant.dragName);
      if (this.closingTimeout) clearTimeout(this.closingTimeout);
      this.closingTimeout = setTimeout(() => {
        this.expandedDragName.set(null);
        this.closingDragName.set(null);
        this.closingTimeout = null;
      }, 220);
    } else {
      if (this.closingTimeout) {
        clearTimeout(this.closingTimeout);
        this.closingTimeout = null;
      }
      this.closingDragName.set(null);
      this.expandedDragName.set(contestant.dragName);
    }
  }
}
