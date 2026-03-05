import { Component, input, signal } from '@angular/core';
import { Contestant } from '../../contestants/models/contestant';
import { ContestantCellComponent } from './contestant-cell/contestant-cell.component';
import { ContestantDetailComponent } from './contestant-detail/contestant-detail.component';

@Component({
  selector: 'app-contestant-grid',
  standalone: true,
  imports: [ContestantCellComponent, ContestantDetailComponent],
  templateUrl: './contestant-grid.component.html',
})
export class ContestantGridComponent {
  readonly contestants = input.required<Contestant[]>();

  /** Drag name du contestant dont le détail est affiché (null = aucun). */
  protected readonly expandedDragName = signal<string | null>(null);

  protected readonly isExpanded = (dragName: string) => this.expandedDragName() === dragName;

  protected trackByDragName(_index: number, contestant: Contestant): string {
    return contestant.dragName;
  }

  /** Image grille : mini promo ou imageUrl. */
  protected getGridImageUrl(contestant: Contestant): string {
    const url = contestant.miniPromoImageUrl?.trim() || contestant.imageUrl?.trim() || '';
    return url;
  }

  protected toggleExpand(contestant: Contestant): void {
    const current = this.expandedDragName();
    this.expandedDragName.set(current === contestant.dragName ? null : contestant.dragName);
  }
}
