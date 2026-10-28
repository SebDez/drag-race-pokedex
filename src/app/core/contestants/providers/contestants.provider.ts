import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { Contestant } from '../models/contestant.model';
import type { ContestantsQuery } from '../models/query.model';
import type { ContestantsFetchResult } from '../models/fetch-results.model';

export abstract class ContestantsDataProvider {
  abstract queryContestants(query: ContestantsQuery): Observable<ContestantsFetchResult>;
  abstract getAllContestants(): Observable<Contestant[]>;
}

export const CONTESTANTS_DATA_PROVIDER = new InjectionToken<ContestantsDataProvider>(
  'CONTESTANTS_DATA_PROVIDER',
);
