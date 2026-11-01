import { TestBed } from '@angular/core/testing';
import { ContestantDetailComponent } from './contestant-detail.component';
import { provideTranslateMock } from '@app/testing/translate-mock';
import { createContestant } from '@app/testing/contestant-fixture';
import { ImageLightboxService } from '@app/shared/ui/image-lightbox/image-lightbox.service';

describe('ContestantDetailComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestantDetailComponent],
      providers: [provideTranslateMock()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ContestantDetailComponent);
    fixture.componentRef.setInput('contestant', createContestant());
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display contestant drag name', () => {
    const contestant = createContestant({ dragName: 'Fancy Queen' });
    const fixture = TestBed.createComponent(ContestantDetailComponent);
    fixture.componentRef.setInput('contestant', contestant);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const h2 = el.querySelector('h2');
    expect(h2?.textContent?.trim()).toBe('Fancy Queen');
  });

  it('should display franchise badge and first franchise name', () => {
    const contestant = createContestant({ firstFranchise: "RuPaul's Drag Race" });
    const fixture = TestBed.createComponent(ContestantDetailComponent);
    fixture.componentRef.setInput('contestant', contestant);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-franchise-badge')).toBeTruthy();
    expect(el.textContent).toContain("RuPaul's Drag Race");
  });

  it('should display wiki link when wikiUrl is set', () => {
    const contestant = createContestant({ wikiUrl: 'https://wiki.test/page' });
    const fixture = TestBed.createComponent(ContestantDetailComponent);
    fixture.componentRef.setInput('contestant', contestant);
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a[href="https://wiki.test/page"]');
    expect(link).toBeTruthy();
  });

  it('should display seasons list', () => {
    const contestant = createContestant({
      seasons: [
        {
          franchise: 'Drag Race France',
          season: '1',
          rawPlace: '2nd',
          places: [2],
          mainPlace: 2,
          isWinner: false,
          challengeWins: 1,
        },
      ],
    });
    const fixture = TestBed.createComponent(ContestantDetailComponent);
    fixture.componentRef.setInput('contestant', contestant);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Drag Race France');
    expect(el.textContent).toContain('S1');
  });

  it('getDetailImageUrl should use promo only (never list imageUrl)', () => {
    const fixture = TestBed.createComponent(ContestantDetailComponent);
    const comp = fixture.componentInstance;
    const withBoth = createContestant({
      imageUrl: 'https://main.jpg',
      miniPromoImageUrl: 'https://promo.jpg',
    });
    expect(comp['getDetailImageUrl'](withBoth)).toBe('https://promo.jpg');
    const onlyMain = createContestant({ imageUrl: 'https://main.jpg', miniPromoImageUrl: '' });
    expect(comp['getDetailImageUrl'](onlyMain)).toBe('');
  });

  it('should open root lightbox when promo image is clicked', () => {
    const contestant = createContestant({
      dragName: 'Fancy Queen',
      miniPromoImageUrl: 'https://promo.jpg',
    });
    const fixture = TestBed.createComponent(ContestantDetailComponent);
    const lightbox = TestBed.inject(ImageLightboxService);
    fixture.componentRef.setInput('contestant', contestant);
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'aside button',
    ) as HTMLButtonElement | null;
    expect(button).toBeTruthy();
    button!.click();

    expect(lightbox.active()).toEqual({
      src: 'https://promo.jpg',
      alt: 'Fancy Queen',
      closeLabelKey: 'detail.closePreview',
      dialogLabelKey: 'detail.enlargeImage',
    });
  });
});


