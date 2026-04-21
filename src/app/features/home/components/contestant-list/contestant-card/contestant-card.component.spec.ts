import { TestBed } from '@angular/core/testing';
import { ContestantCardComponent } from './contestant-card.component';
import { provideTranslateMock } from '../../../testing/translate-mock';
import { createContestant } from '../../../testing/contestant-fixture';

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

  it('should toggle detail panel on click', () => {
    const fixture = TestBed.createComponent(ContestantCardComponent);
    fixture.componentRef.setInput('contestant', createContestant());
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const btn = el.querySelector('button');
    expect(fixture.componentInstance.isExpanded()).toBe(false);
    btn?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.isExpanded()).toBe(true);
    btn?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.isExpanded()).toBe(false);
  });

  it('should set aria-expanded on button', () => {
    const fixture = TestBed.createComponent(ContestantCardComponent);
    fixture.componentRef.setInput('contestant', createContestant());
    fixture.detectChanges();
    const btn = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(btn?.getAttribute('aria-expanded')).toBe('false');
    btn?.click();
    fixture.detectChanges();
    expect(btn?.getAttribute('aria-expanded')).toBe('true');
  });

  it('getCardImageUrl should prefer miniPromoImageUrl then imageUrl', () => {
    const fixture = TestBed.createComponent(ContestantCardComponent);
    const comp = fixture.componentInstance;
    const c = createContestant({
      miniPromoImageUrl: 'https://promo.jpg',
      imageUrl: 'https://main.jpg',
    });
    expect(comp['getCardImageUrl'](c)).toBe('https://promo.jpg');
  });
});
