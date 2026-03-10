import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { CONTESTANTS_DATA_PROVIDER } from '../contestants/contestants-data-provider';
import { Contestant } from '../contestants/models/contestant';
import { tap, catchError } from 'rxjs/operators';
import { of, type Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContestantsStore implements OnDestroy {
  private readonly provider = inject(CONTESTANTS_DATA_PROVIDER);
  private loadSub: Subscription | null = null;

  private readonly state = signal<{
    contestants: Contestant[];
    loading: boolean;
    error: string | null;
  }>({
    contestants: [],
    loading: false,
    error: null,
  });

  readonly contestants = computed(() => this.state().contestants);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly count = computed(() => this.state().contestants.length);

  loadContestants(): void {
    this.loadSub?.unsubscribe();
    this.state.update((s) => ({ ...s, loading: true, error: null }));

    this.loadSub = this.provider
      .getContestants()
      .pipe(
        tap((contestants) => {
          this.state.update((s) => ({
            ...s,
            contestants,
            loading: false,
            error: null,
          }));
        }),
        catchError(() => {
          this.state.update((s) => ({
            ...s,
            loading: false,
            error: 'errors.loadFailed',
          }));
          return of([]);
        }),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
  }
}
