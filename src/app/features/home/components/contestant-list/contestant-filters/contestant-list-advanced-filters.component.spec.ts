import { TestBed } from '@angular/core/testing';
import { ContestantListAdvancedFiltersComponent } from './contestant-list-advanced-filters.component';
import {
  DEFAULT_CONTESTANT_FILTERS,
  type ContestantFilters,
} from '@app/core/contestants/models/contestant-view.model';
import { provideTranslateMock } from '@app/testing/translate-mock';
import { FRANCHISE_NAMES } from '@app/core/contestants/constants/franchises.constants';
import type { ComponentFixture } from '@angular/core/testing';

describe('ContestantListAdvancedFiltersComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestantListAdvancedFiltersComponent],
      providers: [provideTranslateMock()],
    }).compileComponents();
  });

  afterEach(() => {
    document.querySelectorAll('[role="dialog"]').forEach((el) => el.remove());
    document.querySelector('app-root')?.removeAttribute('inert');
    document.body.style.overflow = '';
  });

  async function openDialog(
    fixture: ComponentFixture<ContestantListAdvancedFiltersComponent>,
  ): Promise<HTMLElement> {
    const btn = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="open-advanced-filters-btn"]',
    ) as HTMLElement | null;
    btn?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement | null;
    expect(dialog).toBeTruthy();
    return dialog!;
  }

  it('should create', () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', DEFAULT_CONTESTANT_FILTERS);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display filters button with translation label', () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', DEFAULT_CONTESTANT_FILTERS);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const btn = el.querySelector('[data-testid="open-advanced-filters-btn"]');
    expect(btn?.textContent?.trim()).toContain('filters.label');
  });

  it('should not show active filter dot when no filters are active', () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', DEFAULT_CONTESTANT_FILTERS);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const dot = el.querySelector('[data-testid="active-filters-dot"]');
    expect(dot).toBeFalsy();
  });

  it('should show active filter dot when winnersOnly is true', () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', { ...DEFAULT_CONTESTANT_FILTERS, winnersOnly: true });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const dot = el.querySelector('[data-testid="active-filters-dot"]');
    expect(dot).toBeTruthy();
  });

  it('should show active filter dot when franchiseSeasonKeys has entries', () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', {
      ...DEFAULT_CONTESTANT_FILTERS,
      franchiseSeasonKeys: ['franchise::Drag Race France'],
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const dot = el.querySelector('[data-testid="active-filters-dot"]');
    expect(dot).toBeTruthy();
  });

  it('should open dialog on button click', async () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', DEFAULT_CONTESTANT_FILTERS);
    fixture.detectChanges();
    expect(document.querySelector('[role="dialog"]')).toBeFalsy();
    await openDialog(fixture);
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it('should close dialog when backdrop is clicked', async () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', DEFAULT_CONTESTANT_FILTERS);
    fixture.detectChanges();
    const dialog = await openDialog(fixture);
    const backdrop = dialog.querySelector('[data-testid="dialog-backdrop"]');
    (backdrop as HTMLElement)?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector('[role="dialog"]')).toBeFalsy();
  });

  it('should close dialog when Escape key is pressed', async () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', DEFAULT_CONTESTANT_FILTERS);
    fixture.detectChanges();
    await openDialog(fixture);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector('[role="dialog"]')).toBeFalsy();
  });

  it('should close dialog when close button is clicked', async () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', DEFAULT_CONTESTANT_FILTERS);
    fixture.detectChanges();
    const dialog = await openDialog(fixture);
    const closeBtn = dialog.querySelector('button[aria-label="filters.close"]');
    (closeBtn as HTMLElement)?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector('[role="dialog"]')).toBeFalsy();
  });

  it('should emit filtersChange with winnersOnly true when winners checkbox is toggled', async () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', DEFAULT_CONTESTANT_FILTERS);
    fixture.detectChanges();
    const emitted: ContestantFilters[] = [];
    fixture.componentInstance.filtersChange.subscribe((f) => emitted.push(f));
    const dialog = await openDialog(fixture);
    const winnersCheckbox = dialog.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(winnersCheckbox).toBeTruthy();
    winnersCheckbox.checked = true;
    winnersCheckbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(emitted.length).toBe(1);
    expect(emitted[0].winnersOnly).toBe(true);
  });

  it('should render franchise list in dialog', async () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', DEFAULT_CONTESTANT_FILTERS);
    fixture.detectChanges();
    const dialog = await openDialog(fixture);
    const firstFranchise = FRANCHISE_NAMES[0];
    expect(dialog.textContent).toContain(firstFranchise);
  });

  it('should emit filtersChange with franchise key when franchise checkbox is toggled', async () => {
    const franchise = FRANCHISE_NAMES[0];
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', DEFAULT_CONTESTANT_FILTERS);
    fixture.detectChanges();
    const emitted: ContestantFilters[] = [];
    fixture.componentInstance.filtersChange.subscribe((f) => emitted.push(f));
    const dialog = await openDialog(fixture);
    const scrollArea = dialog.querySelector('[data-testid="franchise-tree"]');
    const franchiseLabel = Array.from(scrollArea?.querySelectorAll('label') ?? []).find(
      (l) => l.textContent?.trim() === franchise,
    );
    const franchiseCheckbox = franchiseLabel?.querySelector('input[type="checkbox"]') as
      | HTMLInputElement
      | null
      | undefined;
    expect(franchiseCheckbox).toBeTruthy();
    franchiseCheckbox!.checked = true;
    franchiseCheckbox!.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(emitted.length).toBe(1);
    expect(emitted[0].franchiseSeasonKeys).toContain(`franchise::${franchise}`);
  });

  it('should emit resetAllFilters and close dialog when reset all is clicked', async () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', DEFAULT_CONTESTANT_FILTERS);
    fixture.detectChanges();
    const emitted: unknown[] = [];
    fixture.componentInstance.resetAllFilters.subscribe(() => emitted.push(true));
    const dialog = await openDialog(fixture);
    dialog
      .querySelector('[data-testid="reset-all-filters-dialog"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(emitted.length).toBe(1);
    expect(document.querySelector('[role="dialog"]')).toBeFalsy();
  });
});
