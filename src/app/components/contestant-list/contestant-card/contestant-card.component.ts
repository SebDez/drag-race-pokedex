import { Component, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Contestant } from '../../../contestants/models/contestant';

@Component({
  selector: 'app-contestant-card',
  standalone: true,
  imports: [NgOptimizedImage, TranslateModule],
  templateUrl: './contestant-card.component.html',
})
export class ContestantCardComponent {
  readonly contestant = input.required<Contestant>();
  readonly isExpanded = input<boolean>(false);

  readonly cardClick = output<Contestant>();

  /** Image carte : imageUrl en priorité, sinon miniPromoImageUrl. */
  protected getCardImageUrl(c: Contestant): string {
    return c.imageUrl?.trim() || c.miniPromoImageUrl?.trim() || '';
  }

  protected onClick(): void {
    this.cardClick.emit(this.contestant());
  }
}
