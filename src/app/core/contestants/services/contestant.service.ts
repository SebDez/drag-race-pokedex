import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { ContestantsQuery } from '../models/query.model';
import type { ContestantsFetchResult } from '../models/fetch-results.model';
import {
  CONTESTANTS_DATA_PROVIDER,
  ContestantsDataProvider,
} from '../providers/contestants.provider';

@Injectable({ providedIn: 'root' })
export class ContestantsService {
  constructor(
    @Inject(CONTESTANTS_DATA_PROVIDER) private readonly provider: ContestantsDataProvider,
  ) {}

  fetchContestants(query: ContestantsQuery): Observable<ContestantsFetchResult> {
    return this.provider.queryContestants(query);
  }
}
