import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalJsonContestantsProvider } from './local-json-contestants.provider';
import { GroupMode } from './constants/group-mode';
import { SortMode } from './constants/sort-mode';
import { DEFAULT_CONTESTANT_FILTERS } from '../store/contestants/types';
import type { Contestant, Season } from './models/contestant';

const FR_US = "RuPaul's Drag Race";
const FR_UK = "RuPaul's Drag Race UK";

function winSeason(franchise: string): Season {
  return {
    franchise,
    season: '1',
    rawPlace: '',
    places: [],
    mainPlace: 1,
    isWinner: true,
    challengeWins: 0,
  };
}

function seasonEntry(franchise: string, season: string, isWinner = false): Season {
  return {
    franchise,
    season,
    rawPlace: '',
    places: [],
    mainPlace: isWinner ? 1 : 2,
    isWinner,
    challengeWins: 0,
  };
}

function makeContestant(
  dragName: string,
  options: {
    firstFranchise?: string;
    totalChallengeWins?: number;
    seasons?: Season[];
    wikiUrl?: string;
    isWinner?: boolean;
  } = {},
): Contestant {
  const firstFranchise = options.firstFranchise ?? FR_US;
  return {
    dragName,
    imageUrl: '',
    wikiUrl: options.wikiUrl ?? '',
    seasons: options.seasons ?? [],
    firstFranchise,
    miniPromoImageUrl: '',
    totalChallengeWins: options.totalChallengeWins ?? 0,
    isWinner: options.isWinner ?? false,
    firstFranchiseCountry: '',
  };
}

describe('LocalJsonContestantsProvider', () => {
  let httpMock: HttpTestingController;
  let provider: LocalJsonContestantsProvider;

  const sampleData: Contestant[] = [
    makeContestant('Zara', { firstFranchise: FR_US }),
    makeContestant('Amy', { firstFranchise: FR_US }),
    makeContestant('Bianca', { firstFranchise: FR_UK }),
    makeContestant('Zoe', { firstFranchise: FR_UK }),
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), LocalJsonContestantsProvider],
    });
    httpMock = TestBed.inject(HttpTestingController);
    provider = TestBed.inject(LocalJsonContestantsProvider);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load JSON and return paginated list for GroupMode.All', async () => {
    const promise = firstValueFrom(
      provider.queryContestants({
        filters: DEFAULT_CONTESTANT_FILTERS,
        sortMode: SortMode.DragNameAsc,
        groupMode: GroupMode.All,
        page: 1,
        pageSize: 2,
      }),
    );

    const req = httpMock.expectOne('/data/contestants_extract.json');
    expect(req.request.method).toBe('GET');
    req.flush(sampleData);

    const result = await promise;

    expect(result.totalFiltered).toBe(4);
    expect(result.viewModel.mode).toBe(GroupMode.All);
    if (result.viewModel.mode === GroupMode.All) {
      expect(result.viewModel.list.length).toBe(2);
      expect(result.viewModel.list.map((c) => c.dragName)).toEqual(['Amy', 'Bianca']);
    }
  });

  it('should apply searchQuery filter before pagination', async () => {
    const promise = firstValueFrom(
      provider.queryContestants({
        filters: { ...DEFAULT_CONTESTANT_FILTERS, searchQuery: 'zo' },
        sortMode: SortMode.DragNameAsc,
        groupMode: GroupMode.All,
        page: 1,
        pageSize: 10,
      }),
    );

    httpMock.expectOne('/data/contestants_extract.json').flush(sampleData);
    const result = await promise;

    expect(result.totalFiltered).toBe(1);
    if (result.viewModel.mode === GroupMode.All) {
      expect(result.viewModel.list.map((c) => c.dragName)).toEqual(['Zoe']);
    }
  });

  it('should paginate grouped alphabetical order by letter blocks then sort within letter (not global wins)', async () => {
    const data: Contestant[] = [
      makeContestant('Beth', { totalChallengeWins: 100 }),
      makeContestant('Amy', { totalChallengeWins: 5 }),
      makeContestant('Ada', { totalChallengeWins: 1 }),
      makeContestant('Ana', { totalChallengeWins: 0 }),
    ];

    const promise = firstValueFrom(
      provider.queryContestants({
        filters: DEFAULT_CONTESTANT_FILTERS,
        sortMode: SortMode.ChallengeWinsDesc,
        groupMode: GroupMode.Alphabetical,
        page: 1,
        pageSize: 3,
      }),
    );

    httpMock.expectOne('/data/contestants_extract.json').flush(data);
    const result = await promise;

    expect(result.totalFiltered).toBe(4);
    expect(result.viewModel.mode).toBe(GroupMode.Alphabetical);
    if (result.viewModel.mode === GroupMode.Alphabetical) {
      const secA = result.viewModel.sections.find((s) => s.key === 'A');
      expect(secA?.contestants.map((c) => c.dragName)).toEqual(['Amy', 'Ada', 'Ana']);
    }
  });

  it('should dedupe a multi-franchise winner once in franchise order when winnersOnly', async () => {
    const data: Contestant[] = [
      makeContestant('DualWinner', {
        seasons: [winSeason(FR_US), winSeason(FR_UK)],
        wikiUrl: 'https://example.com/dual',
        isWinner: true,
      }),
      makeContestant('UkOnly', {
        firstFranchise: FR_UK,
        seasons: [winSeason(FR_UK)],
        wikiUrl: 'https://example.com/uk',
        isWinner: true,
      }),
    ];

    const promise = firstValueFrom(
      provider.queryContestants({
        filters: { ...DEFAULT_CONTESTANT_FILTERS, winnersOnly: true },
        sortMode: SortMode.DragNameAsc,
        groupMode: GroupMode.Franchise,
        page: 1,
        pageSize: 10,
      }),
    );

    httpMock.expectOne('/data/contestants_extract.json').flush(data);
    const result = await promise;

    expect(result.totalFiltered).toBe(2);
    expect(result.viewModel.mode).toBe(GroupMode.Franchise);
    if (result.viewModel.mode === GroupMode.Franchise) {
      const names = result.viewModel.sections.flatMap((s) =>
        s.contestants.map((c) => c.dragName),
      );
      expect(names).toEqual(['DualWinner', 'UkOnly']);
    }
  });

  it('should group by franchise using page slice', async () => {
    const promise = firstValueFrom(
      provider.queryContestants({
        filters: DEFAULT_CONTESTANT_FILTERS,
        sortMode: SortMode.DragNameAsc,
        groupMode: GroupMode.Franchise,
        page: 1,
        pageSize: 4,
      }),
    );

    httpMock.expectOne('/data/contestants_extract.json').flush(sampleData);
    const result = await promise;

    expect(result.viewModel.mode).toBe(GroupMode.Franchise);
    if (result.viewModel.mode === GroupMode.Franchise) {
      const us = result.viewModel.sections.find((s) => s.key === FR_US);
      const uk = result.viewModel.sections.find((s) => s.key === FR_UK);
      expect(us?.contestants.map((c) => c.dragName).sort()).toEqual(['Amy', 'Zara']);
      expect(uk?.contestants.map((c) => c.dragName).sort()).toEqual(['Bianca', 'Zoe']);
    }
  });

  it('should not open late season sections before their turn in seasons pagination', async () => {
    const data: Contestant[] = [
      makeContestant('Alpha', {
        seasons: [seasonEntry(FR_US, '1'), seasonEntry(FR_US, '14')],
      }),
      makeContestant('Beta', {
        seasons: [seasonEntry(FR_US, '14')],
      }),
    ];

    const promise = firstValueFrom(
      provider.queryContestants({
        filters: DEFAULT_CONTESTANT_FILTERS,
        sortMode: SortMode.DragNameAsc,
        groupMode: GroupMode.Seasons,
        page: 1,
        pageSize: 1,
      }),
    );

    httpMock.expectOne('/data/contestants_extract.json').flush(data);
    const result = await promise;

    expect(result.viewModel.mode).toBe(GroupMode.Seasons);
    if (result.viewModel.mode === GroupMode.Seasons) {
      expect(result.viewModel.sections.length).toBe(1);
      expect(result.viewModel.sections[0].key).toBe(`${FR_US} (S1)`);
      expect(result.viewModel.sections[0].contestants.map((c) => c.dragName)).toEqual(['Alpha']);
    }
  });

  it('should use HTTP response cache: only one GET for two queryContestants calls', async () => {
    const q = {
      filters: DEFAULT_CONTESTANT_FILTERS,
      sortMode: SortMode.DragNameAsc,
      groupMode: GroupMode.All,
      page: 1,
      pageSize: 10,
    };

    const p1 = firstValueFrom(provider.queryContestants(q));
    const p2 = firstValueFrom(provider.queryContestants({ ...q, page: 2 }));

    const req = httpMock.expectOne('/data/contestants_extract.json');
    req.flush(sampleData);

    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1.totalFiltered).toBe(4);
    expect(r2.totalFiltered).toBe(4);
    if (r1.viewModel.mode === GroupMode.All && r2.viewModel.mode === GroupMode.All) {
      expect(r1.viewModel.list.length).toBe(4);
      expect(r2.viewModel.list.length).toBe(0);
    }
  });
});
