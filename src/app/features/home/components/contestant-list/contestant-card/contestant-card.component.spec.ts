import { DeferBlockState, TestBed } from '@angular/core/testing';
import { ContestantCardComponent } from './contestant-card.component';
import { provideTranslateMock } from '@app/testing/translate-mock';
import { createContestant } from '@app/testing/contestant-fixture';

async function renderDeferredDetail(fixture: { getDeferBlocks: () => Promise<{ render: (s: DeferBlockState) => Promise<void> }[]>; detectChanges: () => void }) {
  const blocks = await fixture.getDeferBlocks();
  if (blocks[0]) {
    await blocks[0].render(DeferBlockState.Complete);
    fixture.detectChanges();
  }
}

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

  it('should toggle detail panel on click', async () => {
    const fixture = TestBed.createComponent(ContestantCardComponent);
    fixture.componentRef.setInput('contestant', createContestant());
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const btn = el.querySelector('button');
    expect(fixture.componentInstance.isExpanded()).toBe(false);
    expect(el.querySelector('app-contestant-detail')).toBeNull();
    btn?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.isExpanded()).toBe(true);
    await renderDeferredDetail(fixture);
    expect(el.querySelector('app-contestant-detail')).toBeTruthy();
    btn?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.isExpanded()).toBe(false);
    expect(el.querySelector('app-contestant-detail')).toBeNull();
  });

  it('should set aria-expanded and aria-controls on button', async () => {
    const fixture = TestBed.createComponent(ContestantCardComponent);
    fixture.componentRef.setInput('contestant', createContestant());
    fixture.detectChanges();
    const btn = (fixture.nativeElement as HTMLElement).querySelector('button');
    const detailId = fixture.componentInstance['detailPanelId'];
    expect(btn?.getAttribute('aria-expanded')).toBe('false');
    expect(btn?.getAttribute('aria-controls')).toBe(detailId);
    btn?.click();
    fixture.detectChanges();
    expect(btn?.getAttribute('aria-expanded')).toBe('true');
    await renderDeferredDetail(fixture);
    expect((fixture.nativeElement as HTMLElement).querySelector(`#${detailId}`)).toBeTruthy();
  });

  it('getCardImageUrl should use miniPromo only (never full wiki imageUrl)', () => {
    const fixture = TestBed.createComponent(ContestantCardComponent);
    const comp = fixture.componentInstance;
    const withMini = createContestant({
      miniPromoImageUrl: 'https://promo.jpg',
      imageUrl: 'https://main.jpg',
    });
    const withoutMini = createContestant({
      miniPromoImageUrl: '',
      imageUrl: 'https://main.jpg',
    });
    expect(comp['getCardImageUrl'](withMini)).toBe('https://promo.jpg');
    expect(comp['getCardImageUrl'](withoutMini)).toBe('');
  });
});
