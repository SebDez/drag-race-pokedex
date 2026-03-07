import { Component, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Contestant } from '../../../contestants/models/contestant';
import { WinsBadgeComponent } from '../../badges/wins-badge/wins-badge.component';
import { WinnerBadgeComponent } from '../../badges/winner-badge/winner-badge.component';
import { FranchiseBadgeComponent } from '../../badges/franchise-badge/franchise-badge.component';
import { ContestantDetailComponent } from '../contestant-detail/contestant-detail.component';

@Component({
  selector: 'app-contestant-card',
  standalone: true,
  imports: [
    NgOptimizedImage,
    TranslateModule,
    WinsBadgeComponent,
    WinnerBadgeComponent,
    FranchiseBadgeComponent,
    ContestantDetailComponent,
  ],
  templateUrl: './contestant-card.component.html',
})
export class ContestantCardComponent {
  readonly contestant = input.required<Contestant>();

  readonly isExpanded = signal<boolean>(false);

  protected getCardImageUrl(c: Contestant): string {
    return c.miniPromoImageUrl?.trim() || c.imageUrl?.trim() || '';
  }

  protected onClick(): void {
    this.isExpanded.set(!this.isExpanded());
  }
}
