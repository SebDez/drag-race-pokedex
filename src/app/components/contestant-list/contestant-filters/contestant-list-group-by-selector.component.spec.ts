import { TestBed } from '@angular/core/testing';
import { ContestantListGroupBySelectorComponent } from './contestant-list-group-by-selector.component';
import { GroupMode, type ContestantGroupMode } from '../../../contestants/constants/group-mode';
import { provideTranslateMock } from '../../../testing/translate-mock';

const groupByTranslations = { 'groupBy.label': 'Group by' };

describe('ContestantListGroupBySelectorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestantListGroupBySelectorComponent],
      providers: [provideTranslateMock(groupByTranslations)],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ContestantListGroupBySelectorComponent);
    fixture.componentRef.setInput('mode', GroupMode.All);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display label from translation', () => {
    const fixture = TestBed.createComponent(ContestantListGroupBySelectorComponent);
    fixture.componentRef.setInput('mode', GroupMode.All);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const label = el.querySelector('label');
    expect(label?.textContent?.trim()).toBe('Group by');
  });

  it('should render select with current mode value', () => {
    const fixture = TestBed.createComponent(ContestantListGroupBySelectorComponent);
    fixture.componentRef.setInput('mode', GroupMode.Franchise);
    fixture.detectChanges();
    const select = (fixture.nativeElement as HTMLElement).querySelector('select');
    expect(select?.value).toBe(GroupMode.Franchise);
  });

  it('should render options for All, Alphabetical, Franchise, Seasons', () => {
    const fixture = TestBed.createComponent(ContestantListGroupBySelectorComponent);
    fixture.componentRef.setInput('mode', GroupMode.All);
    fixture.detectChanges();
    const options = (fixture.nativeElement as HTMLElement).querySelectorAll('option');
    const values = Array.from(options).map((o) => (o as HTMLOptionElement).value);
    expect(values).toEqual([
      GroupMode.All,
      GroupMode.Alphabetical,
      GroupMode.Franchise,
      GroupMode.Seasons,
    ]);
  });

  it('should emit modeChange when select value changes', () => {
    const fixture = TestBed.createComponent(ContestantListGroupBySelectorComponent);
    fixture.componentRef.setInput('mode', GroupMode.All);
    fixture.detectChanges();
    const emitted: ContestantGroupMode[] = [];
    fixture.componentInstance.modeChange.subscribe((v) => emitted.push(v));
    const select = (fixture.nativeElement as HTMLElement).querySelector('select');
    expect(select).toBeTruthy();
    (select as HTMLSelectElement).value = GroupMode.Franchise;
    (select as HTMLSelectElement).dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(emitted).toEqual([GroupMode.Franchise]);
  });

  it('should not emit when value is unchanged (same mode selected)', () => {
    const fixture = TestBed.createComponent(ContestantListGroupBySelectorComponent);
    fixture.componentRef.setInput('mode', GroupMode.All);
    fixture.detectChanges();
    const emitted: ContestantGroupMode[] = [];
    fixture.componentInstance.modeChange.subscribe((v) => emitted.push(v));
    const select = (fixture.nativeElement as HTMLElement).querySelector('select');
    (select as HTMLSelectElement).value = GroupMode.All;
    (select as HTMLSelectElement).dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(emitted).toEqual([]);
  });
});
