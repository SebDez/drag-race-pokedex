import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Contestant } from '@app/core/contestants/models/contestant.model';
import { WinsBadgeComponent } from '@app/shared/ui/badges/wins-badge/wins-badge.component';
import { WinnerBadgeComponent } from '@app/shared/ui/badges/winner-badge/winner-badge.component';
import { FranchiseBadgeComponent } from '@app/shared/ui/badges/franchise-badge/franchise-badge.component';
import { ContestantSectionSeason } from '@app/core/contestants/models/contestant-view.model';
import { ContestantImageComponent } from '@app/shared/ui/contestant-image/contestant-image.component';

export interface ContestantSelectEvent {
  contestant: Contestant;
  displayedSeason?: ContestantSectionSeason;
}

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
  ],
  templateUrl: './contestant-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContestantCardComponent {
  readonly contestant = input.required<Contestant>();
  readonly displayedSeason = input<ContestantSectionSeason | undefined>();
  readonly selected = input(false);
  readonly selectContestant = output<ContestantSelectEvent>();

  /** List thumbnails use the main wiki `imageUrl` (promo is reserved for detail). */
  protected getCardImageUrl(c: Contestant): string {
    return c.imageUrl?.trim() || '';
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
    this.selectContestant.emit({
      contestant: this.contestant(),
      displayedSeason: this.displayedSeason(),
    });
  }
}
