import { TestBed } from '@angular/core/testing';
import { ContestantListSortBySelectorComponent } from './contestant-list-sort-by-selector.component';
import { SortMode, type ContestantSortMode } from '../../../contestants/constants/sort-mode';
import { provideTranslateMock } from '../../../testing/translate-mock';

describe('ContestantListSortBySelectorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestantListSortBySelectorComponent],
      providers: [provideTranslateMock()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ContestantListSortBySelectorComponent);
    fixture.componentRef.setInput('mode', SortMode.DragNameAsc);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display label from translation', () => {
    const fixture = TestBed.createComponent(ContestantListSortBySelectorComponent);
    fixture.componentRef.setInput('mode', SortMode.DragNameAsc);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const label = el.querySelector('label');
    expect(label?.textContent?.trim()).toBe('sortBy.label');
  });

  it('should render select with current mode value', () => {
    const fixture = TestBed.createComponent(ContestantListSortBySelectorComponent);
    fixture.componentRef.setInput('mode', SortMode.ChallengeWinsDesc);
    fixture.detectChanges();
    const select = (fixture.nativeElement as HTMLElement).querySelector('select');
    expect(select?.value).toBe(SortMode.ChallengeWinsDesc);
  });

  it('should render options for DragNameAsc and ChallengeWinsDesc', () => {
    const fixture = TestBed.createComponent(ContestantListSortBySelectorComponent);
    fixture.componentRef.setInput('mode', SortMode.DragNameAsc);
    fixture.detectChanges();
    const options = (fixture.nativeElement as HTMLElement).querySelectorAll('option');
    const values = Array.from(options).map((o) => (o as HTMLOptionElement).value);
    expect(values).toEqual([SortMode.DragNameAsc, SortMode.ChallengeWinsDesc]);
  });

  it('should emit modeChange when select value changes', () => {
    const fixture = TestBed.createComponent(ContestantListSortBySelectorComponent);
    fixture.componentRef.setInput('mode', SortMode.DragNameAsc);
    fixture.detectChanges();
    const emitted: ContestantSortMode[] = [];
    fixture.componentInstance.modeChange.subscribe((v) => emitted.push(v));
    const select = (fixture.nativeElement as HTMLElement).querySelector('select');
    expect(select).toBeTruthy();
    (select as HTMLSelectElement).value = SortMode.ChallengeWinsDesc;
    (select as HTMLSelectElement).dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(emitted).toEqual([SortMode.ChallengeWinsDesc]);
  });

  it('should not emit when value is unchanged (same mode selected)', () => {
    const fixture = TestBed.createComponent(ContestantListSortBySelectorComponent);
    fixture.componentRef.setInput('mode', SortMode.DragNameAsc);
    fixture.detectChanges();
    const emitted: ContestantSortMode[] = [];
    fixture.componentInstance.modeChange.subscribe((v) => emitted.push(v));
    const select = (fixture.nativeElement as HTMLElement).querySelector('select');
    (select as HTMLSelectElement).value = SortMode.DragNameAsc;
    (select as HTMLSelectElement).dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(emitted).toEqual([]);
  });
});
