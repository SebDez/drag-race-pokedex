import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalJsonContestantsProvider } from './local-json-contestants.provider';
import type { ContestantsQuery } from './models/query';
import type { ContestantsFetchResult } from './models/fetch-results';

/**
 * Facade to the data source. Today : {@link LocalJsonContestantsProvider}
 * (API behavior with query params). Tomorrow : replace with a real HTTP client if needed.
 */
@Injectable({ providedIn: 'root' })
export class ContestantsFetchService {
  private readonly provider = inject(LocalJsonContestantsProvider);

  fetchContestants(query: ContestantsQuery): Observable<ContestantsFetchResult> {
    return this.provider.queryContestants(query);
  }
}
