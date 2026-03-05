import { Component, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Contestant } from '../../../contestants/models/contestant';

@Component({
  selector: 'app-contestant-cell',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './contestant-cell.component.html',
})
export class ContestantCellComponent {
  readonly contestant = input.required<Contestant>();
  /** URL de l'image à afficher dans la grille (mini promo ou imageUrl). */
  readonly imageUrl = input<string>('');
  readonly isSelected = input<boolean>(false);

  readonly cellClick = output<Contestant>();

  protected onClick(): void {
    this.cellClick.emit(this.contestant());
  }
}
