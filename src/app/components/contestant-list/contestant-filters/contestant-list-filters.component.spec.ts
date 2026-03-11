import { TestBed } from '@angular/core/testing';
import { ContestantListFiltersComponent } from './contestant-list-filters.component';
import { GroupMode, type ContestantGroupMode } from '../../../contestants/constants/group-mode';
import { SortMode, type ContestantSortMode } from '../../../contestants/constants/sort-mode';
import { provideTranslateMock } from '../../../testing/translate-mock';

describe('ContestantListFiltersComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestantListFiltersComponent],
      providers: [provideTranslateMock()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ContestantListFiltersComponent);
    fixture.componentRef.setInput('groupMode', GroupMode.All);
    fixture.componentRef.setInput('sortMode', SortMode.DragNameAsc);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render group-by and sort-by selectors', () => {
    const fixture = TestBed.createComponent(ContestantListFiltersComponent);
    fixture.componentRef.setInput('groupMode', GroupMode.All);
    fixture.componentRef.setInput('sortMode', SortMode.DragNameAsc);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-contestant-list-group-by-selector')).toBeTruthy();
    expect(el.querySelector('app-contestant-list-sort-by-selector')).toBeTruthy();
  });

  it('should pass groupMode to group-by selector', () => {
    const fixture = TestBed.createComponent(ContestantListFiltersComponent);
    fixture.componentRef.setInput('groupMode', GroupMode.Franchise);
    fixture.componentRef.setInput('sortMode', SortMode.DragNameAsc);
    fixture.detectChanges();
    const comp = fixture.debugElement.query(
      (n) => n.name === 'app-contestant-list-group-by-selector',
    )?.componentInstance;
    expect(comp?.mode()).toBe(GroupMode.Franchise);
  });

  it('should pass sortMode to sort-by selector', () => {
    const fixture = TestBed.createComponent(ContestantListFiltersComponent);
    fixture.componentRef.setInput('groupMode', GroupMode.All);
    fixture.componentRef.setInput('sortMode', SortMode.ChallengeWinsDesc);
    fixture.detectChanges();
    const comp = fixture.debugElement.query(
      (n) => n.name === 'app-contestant-list-sort-by-selector',
    )?.componentInstance;
    expect(comp?.mode()).toBe(SortMode.ChallengeWinsDesc);
  });

  it('should emit groupModeChange when group-by selector changes', () => {
    const fixture = TestBed.createComponent(ContestantListFiltersComponent);
    fixture.componentRef.setInput('groupMode', GroupMode.All);
    fixture.componentRef.setInput('sortMode', SortMode.DragNameAsc);
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

  it('should emit sortModeChange when sort-by selector changes', () => {
    const fixture = TestBed.createComponent(ContestantListFiltersComponent);
    fixture.componentRef.setInput('groupMode', GroupMode.All);
    fixture.componentRef.setInput('sortMode', SortMode.DragNameAsc);
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
});
