import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { ContestantsStore } from '../../store/contestants/contestants.store';
import { GroupMode } from '../../contestants/constants/group-mode';
import { SortMode } from '../../contestants/constants/sort-mode';
import { provideTranslateMock } from '../../testing/translate-mock';
import { signal } from '@angular/core';
import { vi } from 'vitest';

const defaultFilters = { winnersOnly: false, franchiseSeasonKeys: [] };

describe('HomeComponent', () => {
  let loadContestantsSpy: unknown;

  beforeEach(async () => {
    const store = {
      contestants: signal([]),
      groupMode: signal(GroupMode.All),
      sortMode: signal(SortMode.DragNameAsc),
      filters: signal(defaultFilters),
      loading: signal(false),
      error: signal(null as string | null),
      count: signal(0),
      viewModel: signal({ mode: GroupMode.All, list: [] as unknown[], sections: null }),
      setGroupMode: () => {},
      setSortMode: () => {},
      setFilters: () => {},
      loadContestants: () => {},
    };
    loadContestantsSpy = vi.spyOn(store, 'loadContestants');

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideTranslateMock(), { provide: ContestantsStore, useValue: store }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call store.loadContestants on init', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    expect(loadContestantsSpy).toHaveBeenCalled();
  });

  it('should show loading state when store.loading is true', () => {
    const store = TestBed.inject(ContestantsStore) as unknown as {
      loading: ReturnType<typeof signal>;
      error: ReturnType<typeof signal>;
      contestants: ReturnType<typeof signal>;
      groupMode: ReturnType<typeof signal>;
      sortMode: ReturnType<typeof signal>;
      filters: ReturnType<typeof signal>;
      count: ReturnType<typeof signal>;
      viewModel: ReturnType<typeof signal>;
      loadContestants: () => void;
    };
    store.loading = signal(true);
    store.error = signal(null);
    store.contestants = signal([]);
    store.groupMode = signal(GroupMode.All);
    store.sortMode = signal(SortMode.DragNameAsc);
    store.filters = signal(defaultFilters);
    store.viewModel = signal({ mode: GroupMode.All, list: [], sections: null });
    store.count = signal(0);

    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="status"]')).toBeTruthy();
    expect(el.textContent).toContain('home.loading');
  });

  it('should show error when store.error is set', () => {
    const store = TestBed.inject(ContestantsStore) as unknown as {
      loading: ReturnType<typeof signal>;
      error: ReturnType<typeof signal>;
      contestants: ReturnType<typeof signal>;
      groupMode: ReturnType<typeof signal>;
      sortMode: ReturnType<typeof signal>;
      filters: ReturnType<typeof signal>;
      count: ReturnType<typeof signal>;
      viewModel: ReturnType<typeof signal>;
      loadContestants: () => void;
    };
    store.loading = signal(false);
    store.error = signal('errors.loadFailed');
    store.contestants = signal([]);
    store.groupMode = signal(GroupMode.All);
    store.sortMode = signal(SortMode.DragNameAsc);
    store.filters = signal(defaultFilters);
    store.viewModel = signal({ mode: GroupMode.All, list: [], sections: null });
    store.count = signal(0);

    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('should show contestant list when loaded', () => {
    const store = TestBed.inject(ContestantsStore) as unknown as {
      loading: ReturnType<typeof signal>;
      error: ReturnType<typeof signal>;
      contestants: ReturnType<typeof signal>;
      groupMode: ReturnType<typeof signal>;
      sortMode: ReturnType<typeof signal>;
      filters: ReturnType<typeof signal>;
      count: ReturnType<typeof signal>;
      viewModel: ReturnType<typeof signal>;
      loadContestants: () => void;
    };
    store.loading = signal(false);
    store.error = signal(null);
    store.contestants = signal([]);
    store.groupMode = signal(GroupMode.All);
    store.sortMode = signal(SortMode.DragNameAsc);
    store.filters = signal(defaultFilters);
    store.viewModel = signal({ mode: GroupMode.All, list: [], sections: null });
    store.count = signal(42);

    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-contestant-list')).toBeTruthy();
  });
});
