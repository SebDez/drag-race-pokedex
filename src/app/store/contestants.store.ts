import { Injectable, inject, signal, computed } from '@angular/core';
import { CONTESTANTS_DATA_PROVIDER } from '../contestants/contestants-data-provider';
import { Contestant } from '../contestants/models/contestant';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContestantsStore {
  private readonly provider = inject(CONTESTANTS_DATA_PROVIDER);

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
    this.state.update((s) => ({ ...s, loading: true, error: null }));

    this.provider
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
}
