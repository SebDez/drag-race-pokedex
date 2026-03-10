import { TestBed } from '@angular/core/testing';
import { ContestantListComponent } from './contestant-list.component';
import { GroupMode } from '../../contestants/constants/group-mode';
import { createContestant } from '../../testing/contestant-fixture';
import { provideTranslateMock } from '../../testing/translate-mock';

describe('ContestantListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestantListComponent],
      providers: [provideTranslateMock()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ContestantListComponent);
    fixture.componentRef.setInput('viewModel', { mode: GroupMode.All, list: [], sections: null });
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render no cards when viewModel list is empty', () => {
    const fixture = TestBed.createComponent(ContestantListComponent);
    fixture.componentRef.setInput('viewModel', { mode: GroupMode.All, list: [], sections: null });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('app-contestant-card').length).toBe(0);
  });

  it('should render one card per contestant in list mode', () => {
    const contestants = [
      createContestant({ dragName: 'Queen A' }),
      createContestant({ dragName: 'Queen B' }),
    ];
    const fixture = TestBed.createComponent(ContestantListComponent);
    fixture.componentRef.setInput('viewModel', { mode: GroupMode.All, list: contestants, sections: null });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('app-contestant-card');
    expect(cards.length).toBe(2);
  });

  it('should use trackBy dragName', () => {
    const fixture = TestBed.createComponent(ContestantListComponent);
    const trackBy = fixture.componentInstance['trackByDragName'];
    const c = createContestant({ dragName: 'Tracked' });
    expect(trackBy(0, c)).toBe('Tracked');
  });
});
