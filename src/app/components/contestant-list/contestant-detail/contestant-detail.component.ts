import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Contestant } from '../../../contestants/models/contestant';
import { WinsBadgeComponent } from '../../badges/wins-badge/wins-badge.component';
import { WinnerBadgeComponent } from '../../badges/winner-badge/winner-badge.component';
import { FranchiseBadgeComponent } from '../../badges/franchise-badge/franchise-badge.component';
import { PlaceOrdinalPipe } from '../../../core/pipes/place-ordinal.pipe';
import { ContestantImageComponent } from '../../contestant-image/contestant-image.component';
import { ContestantSectionSeason } from '../../../store/contestants/types';

@Component({
  selector: 'app-contestant-detail',
  standalone: true,
  imports: [
    ContestantImageComponent,
    TranslateModule,
    WinsBadgeComponent,
    WinnerBadgeComponent,
    FranchiseBadgeComponent,
    PlaceOrdinalPipe,
  ],
  templateUrl: './contestant-detail.component.html',
})
export class ContestantDetailComponent {
  readonly contestant = input.required<Contestant>();
  readonly displayedSeason = input<ContestantSectionSeason | undefined>();

  protected getDetailImageUrl(c: Contestant): string {
    const url = c.imageUrl?.trim() || c.miniPromoImageUrl?.trim() || '';
    return url;
  }

  protected isDisplayedSeasonWinner(c: Contestant): boolean {
    const season = this.displayedSeason();
    if (!season) return false;
    return c.seasons.some(
      (s) => s.season === season.season && s.franchise === season.franchise && s.isWinner,
    );
  }

  protected shouldShowWinnerBadge(c: Contestant): boolean {
    return this.displayedSeason() ? this.isDisplayedSeasonWinner(c) : c.isWinner;
  }
}
