import { TestBed } from '@angular/core/testing';
import { ContestantListFiltersComponent } from './contestant-list-filters.component';
import {
  GroupMode,
  type ContestantGroupMode,
} from '@app/core/contestants/constants/group-mode.constants';
import {
  SortMode,
  type ContestantSortMode,
} from '@app/core/contestants/constants/sort-mode.constants';
import {
  DEFAULT_CONTESTANT_FILTERS,
  type ContestantFilters,
} from '@app/core/contestants/models/contestant-view.model';
import { provideTranslateMock } from '@app/testing/translate-mock';

function setFilterInputs(
  fixture: { componentRef: { setInput: (name: string, value: unknown) => void } },
  overrides: Partial<{
    groupMode: ContestantGroupMode;
    sortMode: ContestantSortMode;
    filters: ContestantFilters;
  }> = {},
): void {
  fixture.componentRef.setInput('groupMode', overrides.groupMode ?? GroupMode.All);
  fixture.componentRef.setInput('sortMode', overrides.sortMode ?? SortMode.DragNameAsc);
  fixture.componentRef.setInput('filters', overrides.filters ?? DEFAULT_CONTESTANT_FILTERS);
}

describe('ContestantListFiltersComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestantListFiltersComponent],
      providers: [provideTranslateMock()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ContestantListFiltersComponent);
    setFilterInputs(fixture);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render search bar, group-by, sort-by and advanced-filters', () => {
    const fixture = TestBed.createComponent(ContestantListFiltersComponent);
    setFilterInputs(fixture);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-contestant-list-search-bar')).toBeTruthy();
    expect(el.querySelector('app-contestant-list-group-by-selector')).toBeTruthy();
    expect(el.querySelector('app-contestant-list-sort-by-selector')).toBeTruthy();
    expect(el.querySelector('app-contestant-list-advanced-filters')).toBeTruthy();
  });

  it('should emit filtersChange with searchQuery when search input changes', async () => {
    const fixture = TestBed.createComponent(ContestantListFiltersComponent);
    setFilterInputs(fixture);
    fixture.detectChanges();
    const emitted: ContestantFilters[] = [];
    fixture.componentInstance.filtersChange.subscribe((f) => emitted.push(f));
    const searchEl = (fixture.nativeElement as HTMLElement).querySelector(
      'app-contestant-list-search-bar input[type="search"]',
    ) as HTMLInputElement;
    expect(searchEl).toBeTruthy();
    searchEl.value = 'Raja';
    searchEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(emitted.length).toBe(0);
    await new Promise((r) => setTimeout(r, 300));
    fixture.detectChanges();
    expect(emitted.length).toBe(1);
    expect(emitted[0].searchQuery).toBe('Raja');
  });

  it('should pass groupMode to group-by selector', () => {
    const fixture = TestBed.createComponent(ContestantListFiltersComponent);
    setFilterInputs(fixture, { groupMode: GroupMode.Franchise });
    fixture.detectChanges();
    const comp = fixture.debugElement.query(
      (n) => n.name === 'app-contestant-list-group-by-selector',
    )?.componentInstance;
    expect(comp?.mode()).toBe(GroupMode.Franchise);
  });

  it('should pass sortMode to sort-by selector', () => {
    const fixture = TestBed.createComponent(ContestantListFiltersComponent);
    setFilterInputs(fixture, { sortMode: SortMode.ChallengeWinsDesc });
    fixture.detectChanges();
    const comp = fixture.debugElement.query(
      (n) => n.name === 'app-contestant-list-sort-by-selector',
    )?.componentInstance;
    expect(comp?.mode()).toBe(SortMode.ChallengeWinsDesc);
  });

  it('should emit groupModeChange when group-by selector changes', () => {
    const fixture = TestBed.createComponent(ContestantListFiltersComponent);
    setFilterInputs(fixture);
    fixture.detectChanges();
    const emitted: ContestantGroupMode[] = [];
    fixture.componentInstance.groupModeChange.subscribe((v) => emitted.push(v));
    const groupSelectorEl = (fixture.nativeElement as HTMLElement).querySelector(
      'app-contestant-list-group-by-selector',
    );
    const select = groupSelectorEl?.querySelector('select');
    expect(select).toBeTruthy();
    (select as HTMLSelectElement).value = GroupMode.Seasons;
    (select as HTMLSelectElement).dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(emitted).toEqual([GroupMode.Seasons]);
  });

  it('should pass filters to advanced-filters and emit filtersChange when they change', async () => {
    const fixture = TestBed.createComponent(ContestantListFiltersComponent);
    setFilterInputs(fixture);
    fixture.detectChanges();
    const emitted: ContestantFilters[] = [];
    fixture.componentInstance.filtersChange.subscribe((f) => emitted.push(f));
    const advancedEl = (fixture.nativeElement as HTMLElement).querySelector(
      'app-contestant-list-advanced-filters',
    );
    const openBtn = advancedEl?.querySelector(
      '[data-testid="open-advanced-filters-btn"]',
    ) as HTMLElement | null;
    openBtn?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const winnersCheckbox = document.querySelector(
      '[role="dialog"] input[type="checkbox"]',
    ) as HTMLInputElement | null;
    expect(winnersCheckbox).toBeTruthy();
    winnersCheckbox!.checked = true;
    winnersCheckbox!.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(emitted.length).toBe(1);
    expect(emitted[0].winnersOnly).toBe(true);
    document.querySelectorAll('[role="dialog"]').forEach((el) => el.remove());
    document.body.style.overflow = '';
  });

  it('should emit sortModeChange when sort-by selector changes', () => {
    const fixture = TestBed.createComponent(ContestantListFiltersComponent);
    setFilterInputs(fixture);
    fixture.detectChanges();
    const emitted: ContestantSortMode[] = [];
    fixture.componentInstance.sortModeChange.subscribe((v) => emitted.push(v));
    const sortSelectorEl = (fixture.nativeElement as HTMLElement).querySelector(
      'app-contestant-list-sort-by-selector',
    );
    const select = sortSelectorEl?.querySelector('select');
    expect(select).toBeTruthy();
    (select as HTMLSelectElement).value = SortMode.ChallengeWinsDesc;
    (select as HTMLSelectElement).dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(emitted).toEqual([SortMode.ChallengeWinsDesc]);
  });

  it('should emit resetAllFilters when toolbar reset is clicked', () => {
    const fixture = TestBed.createComponent(ContestantListFiltersComponent);
    setFilterInputs(fixture, {
      filters: { ...DEFAULT_CONTESTANT_FILTERS, searchQuery: 'test' },
    });
    fixture.detectChanges();
    const emitted: unknown[] = [];
    fixture.componentInstance.resetAllFilters.subscribe(() => emitted.push(true));
    const btn = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="reset-all-filters-toolbar"]',
    );
    expect(btn).toBeTruthy();
    (btn as HTMLButtonElement).click();
    expect(emitted.length).toBe(1);
  });

  it('should disable toolbar reset when already at default state', () => {
    const fixture = TestBed.createComponent(ContestantListFiltersComponent);
    setFilterInputs(fixture);
    fixture.detectChanges();
    const btn = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="reset-all-filters-toolbar"]',
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
