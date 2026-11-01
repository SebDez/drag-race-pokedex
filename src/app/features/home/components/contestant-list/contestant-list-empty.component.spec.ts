import { TestBed } from '@angular/core/testing';
import { ContestantListEmptyComponent } from './contestant-list-empty.component';
import { provideTranslateMock } from '@app/testing/translate-mock';
import { GroupMode } from '@app/core/contestants/constants/group-mode.constants';
import { SortMode } from '@app/core/contestants/constants/sort-mode.constants';
import { DEFAULT_CONTESTANT_FILTERS } from '@app/core/contestants/models/contestant-view.model';

describe('ContestantListEmptyComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestantListEmptyComponent],
      providers: [provideTranslateMock()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ContestantListEmptyComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show search and winners in filter recap', () => {
    const fixture = TestBed.createComponent(ContestantListEmptyComponent);
    fixture.componentRef.setInput('filters', {
      ...DEFAULT_CONTESTANT_FILTERS,
      searchQuery: 'Aquaria',
      winnersOnly: true,
    });
    fixture.detectChanges();
    const recap = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="empty-filter-recap"]',
    );
    expect(recap?.textContent).toContain('home.filterRecap.search');
    expect(recap?.textContent).toContain('filters.winnersOnly');
  });

  it('should emit resetAllFilters when reset button is clicked', () => {
    const fixture = TestBed.createComponent(ContestantListEmptyComponent);
    fixture.componentRef.setInput('groupMode', GroupMode.All);
    fixture.componentRef.setInput('sortMode', SortMode.DragNameAsc);
    fixture.detectChanges();
    const emitted: unknown[] = [];
    fixture.componentInstance.resetAllFilters.subscribe(() => emitted.push(true));
    const btn = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="empty-reset-filters"]',
    ) as HTMLElement | null;
    btn?.click();
    expect(emitted.length).toBe(1);
  });
});
