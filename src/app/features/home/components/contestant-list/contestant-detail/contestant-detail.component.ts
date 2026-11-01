import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map, startWith } from 'rxjs/operators';
import { Contestant } from '@app/core/contestants/models/contestant.model';
import { WinsBadgeComponent } from '@app/shared/ui/badges/wins-badge/wins-badge.component';
import { WinnerBadgeComponent } from '@app/shared/ui/badges/winner-badge/winner-badge.component';
import { FranchiseBadgeComponent } from '@app/shared/ui/badges/franchise-badge/franchise-badge.component';
import { PlaceOrdinalPipe } from '@app/core/pipes/place-ordinal.pipe';
import { ContestantImageComponent } from '@app/shared/ui/contestant-image/contestant-image.component';
import { ImageLightboxService } from '@app/shared/ui/image-lightbox/image-lightbox.service';
import { ContestantSectionSeason } from '@app/core/contestants/models/contestant-view.model';

export type ContestantDetailVariant = 'pane' | 'fullscreen';

@Component({
  selector: 'app-contestant-detail',
  standalone: true,
  imports: [
    ContestantImageComponent,
    NgClass,
    TranslateModule,
    WinsBadgeComponent,
    WinnerBadgeComponent,
    FranchiseBadgeComponent,
    PlaceOrdinalPipe,
  ],
  templateUrl: './contestant-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContestantDetailComponent {
  private readonly translate = inject(TranslateService);
  private readonly lightbox = inject(ImageLightboxService);

  readonly contestant = input.required<Contestant>();
  readonly displayedSeason = input<ContestantSectionSeason | undefined>();
  readonly variant = input<ContestantDetailVariant>('pane');

  protected readonly lang = toSignal(
    this.translate.onLangChange.pipe(
      map((e) => e.lang.slice(0, 2).toLowerCase()),
      startWith((this.translate.currentLang ?? 'en').slice(0, 2).toLowerCase()),
    ),
    { initialValue: 'en' },
  );

  /** Detail panel uses promo (`miniPromoImageUrl` ← `promoImageURL`). */
  protected getDetailImageUrl(c: Contestant): string {
    return c.miniPromoImageUrl?.trim() || '';
  }

  protected openLightbox(): void {
    const c = this.contestant();
    this.lightbox.open(this.getDetailImageUrl(c), c.dragName);
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
