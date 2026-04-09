import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContestantsFetchService } from './contestants-fetch.service';
import { LocalJsonContestantsProvider } from './local-json-contestants.provider';
import { GroupMode } from './constants/group-mode';
import { SortMode } from './constants/sort-mode';
import { DEFAULT_CONTESTANT_FILTERS } from '../store/contestants/types';

describe('ContestantsFetchService', () => {
  let queryContestantsMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryContestantsMock = vi.fn().mockImplementation(() =>
      of({
        viewModel: { mode: GroupMode.All, list: [], sections: null },
        totalFiltered: 0,
      }),
    );

    TestBed.configureTestingModule({
      providers: [
        ContestantsFetchService,
        {
          provide: LocalJsonContestantsProvider,
          useValue: { queryContestants: queryContestantsMock },
        },
      ],
    });
  });

  it('should delegate fetchContestants to LocalJsonContestantsProvider.queryContestants', async () => {
    const service = TestBed.inject(ContestantsFetchService);
    const query = {
      filters: DEFAULT_CONTESTANT_FILTERS,
      sortMode: SortMode.DragNameAsc,
      groupMode: GroupMode.All,
      page: 2,
      pageSize: 12,
    };

    const result = await firstValueFrom(service.fetchContestants(query));

    expect(queryContestantsMock).toHaveBeenCalledTimes(1);
    expect(queryContestantsMock).toHaveBeenCalledWith(query);
    expect(result.totalFiltered).toBe(0);
    expect(result.viewModel.mode).toBe(GroupMode.All);
  });
});
