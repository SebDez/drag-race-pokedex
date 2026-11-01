import { TestBed } from '@angular/core/testing';
import { ContestantCardComponent } from './contestant-card.component';
import { provideTranslateMock } from '@app/testing/translate-mock';
import { createContestant } from '@app/testing/contestant-fixture';

describe('ContestantCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestantCardComponent],
      providers: [provideTranslateMock()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ContestantCardComponent);
    fixture.componentRef.setInput('contestant', createContestant());
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display contestant name in button', () => {
    const contestant = createContestant({ dragName: 'Card Queen' });
    const fixture = TestBed.createComponent(ContestantCardComponent);
    fixture.componentRef.setInput('contestant', contestant);
    fixture.detectChanges();
    const btn = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(btn?.getAttribute('aria-label')).toBe('Card Queen');
    expect(btn?.textContent).toContain('Card Queen');
  });

  it('should emit selectContestant on click', () => {
    const contestant = createContestant({ dragName: 'Select Queen' });
    const fixture = TestBed.createComponent(ContestantCardComponent);
    fixture.componentRef.setInput('contestant', contestant);
    fixture.detectChanges();
    const emitted: unknown[] = [];
    fixture.componentInstance.selectContestant.subscribe((e) => emitted.push(e));
    const btn = (fixture.nativeElement as HTMLElement).querySelector('button');
    btn?.click();
    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({ contestant, displayedSeason: undefined });
  });

  it('should set aria-current when selected', () => {
    const fixture = TestBed.createComponent(ContestantCardComponent);
    fixture.componentRef.setInput('contestant', createContestant());
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();
    const btn = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(btn?.getAttribute('aria-current')).toBe('true');
    expect((fixture.nativeElement as HTMLElement).querySelector('.queen-card--expanded')).toBeTruthy();
  });

  it('should not render inline detail', () => {
    const fixture = TestBed.createComponent(ContestantCardComponent);
    fixture.componentRef.setInput('contestant', createContestant());
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('app-contestant-detail')).toBeNull();
  });

  it('getCardImageUrl should use imageUrl only (promo is for detail)', () => {
    const fixture = TestBed.createComponent(ContestantCardComponent);
    const comp = fixture.componentInstance;
    const withBoth = createContestant({
      miniPromoImageUrl: 'https://promo.jpg',
      imageUrl: 'https://main.jpg',
    });
    const withoutMain = createContestant({
      miniPromoImageUrl: 'https://promo.jpg',
      imageUrl: '',
    });
    expect(comp['getCardImageUrl'](withBoth)).toBe('https://main.jpg');
    expect(comp['getCardImageUrl'](withoutMain)).toBe('');
  });
});
