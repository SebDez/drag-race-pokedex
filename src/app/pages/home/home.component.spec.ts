import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { ContestantsStore } from '../../store/contestants.store';
import { provideTranslateMock } from '../../testing/translate-mock';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('HomeComponent', () => {
  let loadContestantsSpy: unknown;

  beforeEach(async () => {
    const store = {
      contestants: signal([]),
      loading: signal(false),
      error: signal(null as string | null),
      count: signal(0),
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
      count: ReturnType<typeof signal>;
      loadContestants: () => void;
    };
    store.loading = signal(true);
    store.error = signal(null);
    store.contestants = signal([]);
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
      count: ReturnType<typeof signal>;
      loadContestants: () => void;
    };
    store.loading = signal(false);
    store.error = signal('errors.loadFailed');
    store.contestants = signal([]);
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
      count: ReturnType<typeof signal>;
      loadContestants: () => void;
    };
    store.loading = signal(false);
    store.error = signal(null);
    store.contestants = signal([]);
    store.count = signal(42);

    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-contestant-list')).toBeTruthy();
  });
});
