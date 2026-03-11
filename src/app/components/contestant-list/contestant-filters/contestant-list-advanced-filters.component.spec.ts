import { TestBed } from '@angular/core/testing';
import { ContestantListAdvancedFiltersComponent } from './contestant-list-advanced-filters.component';
import { type ContestantFilters } from '../../../store/contestants/types';
import { provideTranslateMock } from '../../../testing/translate-mock';
import { FRANCHISE_NAMES } from '../../../contestants/constants/franchises';

const defaultFilters: ContestantFilters = {
  winnersOnly: false,
  franchiseSeasonKeys: [],
};

describe('ContestantListAdvancedFiltersComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestantListAdvancedFiltersComponent],
      providers: [provideTranslateMock()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', defaultFilters);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display filters button with translation label', () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', defaultFilters);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const btn = el.querySelector('button');
    expect(btn?.textContent?.trim()).toContain('filters.label');
  });

  it('should not show active filter dot when no filters are active', () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', defaultFilters);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const dot = el.querySelector('.rounded-full.bg-\\(--color-pink\\)');
    expect(dot).toBeFalsy();
  });

  it('should show active filter dot when winnersOnly is true', () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', { ...defaultFilters, winnersOnly: true });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const dot = el.querySelector('.rounded-full.bg-\\(--color-pink\\)');
    expect(dot).toBeTruthy();
  });

  it('should show active filter dot when franchiseSeasonKeys has entries', () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', {
      ...defaultFilters,
      franchiseSeasonKeys: ['franchise::Drag Race France'],
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const dot = el.querySelector('.rounded-full.bg-\\(--color-pink\\)');
    expect(dot).toBeTruthy();
  });

  it('should open dialog on button click', () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', defaultFilters);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="dialog"]')).toBeFalsy();
    const btn = el.querySelector('button');
    btn?.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it('should close dialog when backdrop is clicked', () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', defaultFilters);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector('button')?.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="dialog"]')).toBeTruthy();
    const backdrop = el.querySelector('.absolute.inset-0.bg-black\\/50');
    (backdrop as HTMLElement)?.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="dialog"]')).toBeFalsy();
  });

  it('should close dialog when close button is clicked', () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', defaultFilters);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector('button')?.click();
    fixture.detectChanges();
    const dialog = el.querySelector('[role="dialog"]');
    const closeBtn = dialog?.querySelector('button[aria-label="filters.close"]');
    (closeBtn as HTMLElement)?.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="dialog"]')).toBeFalsy();
  });

  it('should emit filtersChange with winnersOnly true when winners checkbox is toggled', () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', defaultFilters);
    fixture.detectChanges();
    const emitted: ContestantFilters[] = [];
    fixture.componentInstance.filtersChange.subscribe((f) => emitted.push(f));
    const btn = (fixture.nativeElement as HTMLElement).querySelector('button');
    btn?.click();
    fixture.detectChanges();
    const winnersCheckbox = (fixture.nativeElement as HTMLElement).querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(winnersCheckbox).toBeTruthy();
    winnersCheckbox.checked = true;
    winnersCheckbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(emitted.length).toBe(1);
    expect(emitted[0].winnersOnly).toBe(true);
  });

  it('should render franchise list in dialog', () => {
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', defaultFilters);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const firstFranchise = FRANCHISE_NAMES[0];
    expect(el.textContent).toContain(firstFranchise);
  });

  it('should emit filtersChange with franchise key when franchise checkbox is toggled', () => {
    const franchise = FRANCHISE_NAMES[0];
    const fixture = TestBed.createComponent(ContestantListAdvancedFiltersComponent);
    fixture.componentRef.setInput('filters', defaultFilters);
    fixture.detectChanges();
    const emitted: ContestantFilters[] = [];
    fixture.componentInstance.filtersChange.subscribe((f) => emitted.push(f));
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const scrollArea = el.querySelector('.max-h-64.overflow-auto');
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
});
