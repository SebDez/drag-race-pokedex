import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Contestant } from './models/contestant';

/**
 * Abstraction for the source of the contestants.
 * Allows to change the implementation (local JSON, API, etc.) without touching the store.
 */
export abstract class ContestantsDataProvider {
  abstract getContestants(): Observable<Contestant[]>;
}

export const CONTESTANTS_DATA_PROVIDER = new InjectionToken<ContestantsDataProvider>(
  'CONTESTANTS_DATA_PROVIDER',
);
