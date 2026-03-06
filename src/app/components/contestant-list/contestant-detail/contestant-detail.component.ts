import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Contestant } from '../../../contestants/models/contestant';
import { WinsBadgeComponent } from '../../badges/wins-badge/wins-badge.component';
import { WinnerBadgeComponent } from '../../badges/winner-badge/winner-badge.component';
import { FranchiseBadgeComponent } from '../../badges/franchise-badge/franchise-badge.component';

@Component({
  selector: 'app-contestant-detail',
  standalone: true,
  imports: [
    NgOptimizedImage,
    TranslateModule,
    WinsBadgeComponent,
    WinnerBadgeComponent,
    FranchiseBadgeComponent,
  ],
  templateUrl: './contestant-detail.component.html',
  styleUrl: './contestant-detail.component.css',
})
export class ContestantDetailComponent {
  readonly contestant = input.required<Contestant>();
  readonly isClosing = input<boolean>(false);

  /** Image détail : imageUrl en priorité, sinon miniPromoImageUrl. */
  protected getDetailImageUrl(c: Contestant): string {
    const url = c.imageUrl?.trim() || c.miniPromoImageUrl?.trim() || '';
    return url;
  }
}
