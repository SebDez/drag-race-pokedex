import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { ContestantsQuery } from './models/query';
import type { ContestantsFetchResult } from './models/fetch-results';

/**
 * Abstraction for the source of the contestants.
 * Allows to change the implementation (local JSON, API, etc.) without touching the store.
 */
export abstract class ContestantsDataProvider {
  abstract queryContestants(query: ContestantsQuery): Observable<ContestantsFetchResult>;
}

export const CONTESTANTS_DATA_PROVIDER = new InjectionToken<ContestantsDataProvider>(
  'CONTESTANTS_DATA_PROVIDER',
);
