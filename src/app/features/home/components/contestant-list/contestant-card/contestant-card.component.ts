import { Component, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Contestant } from '@app/core/contestants/models/contestant.model';
import { WinsBadgeComponent } from '@app/shared/ui/badges/wins-badge/wins-badge.component';
import { WinnerBadgeComponent } from '@app/shared/ui/badges/winner-badge/winner-badge.component';
import { FranchiseBadgeComponent } from '@app/shared/ui/badges/franchise-badge/franchise-badge.component';
import { ContestantDetailComponent } from '../contestant-detail/contestant-detail.component';
import { ContestantSectionSeason } from '@app/core/contestants/models/contestant-view.model';
import { ContestantImageComponent } from '@app/shared/ui/contestant-image/contestant-image.component';

@Component({
  selector: 'app-contestant-card',
  standalone: true,
  imports: [
    ContestantImageComponent,
    NgClass,
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
  readonly displayedSeason = input<ContestantSectionSeason | undefined>();

  readonly isExpanded = signal<boolean>(false);

  protected getCardImageUrl(c: Contestant): string {
    return c.miniPromoImageUrl?.trim() || c.imageUrl?.trim() || '';
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

  protected onClick(): void {
    this.isExpanded.set(!this.isExpanded());
  }
}
