import { describe, expect, it } from 'vitest';
import type { ContestantsExtractDto, QueenDto } from '../models/contestant.dto';
import { mapContestantsExtract, mapQueenDto } from './contestant.mapper';

function makeQueen(overrides: Partial<QueenDto> = {}): QueenDto {
  return {
    id: 'test-queen',
    dragName: 'Test Queen',
    imageUrl: 'https://example.com/img.jpg',
    wikiUrl: 'https://wiki.example.com/Test_Queen',
    seasons: [
      {
        franchise: "RuPaul's Drag Race",
        season: '1',
        rawPlace: '1st',
        places: [1],
        mainPlace: 1,
        isWinner: true,
        challengeWins: 2,
      },
    ],
    firstFranchise: "RuPaul's Drag Race",
    promoImageURL: 'https://example.com/promo.jpg',
    totalChallengeWins: 2,
    isWinner: true,
    firstFranchiseCountry: 'United States',
    ...overrides,
  };
}

describe('contestant.mapper', () => {
  it('maps promoImageURL to miniPromoImageUrl', () => {
    const contestant = mapQueenDto(makeQueen({ promoImageURL: 'https://promo.jpg' }));
    expect(contestant.miniPromoImageUrl).toBe('https://promo.jpg');
  });

  it('coerces null challenge wins to 0', () => {
    const contestant = mapQueenDto(
      makeQueen({
        totalChallengeWins: null,
        seasons: [
          {
            franchise: "RuPaul's Drag Race",
            season: '1',
            rawPlace: '5th',
            places: [5],
            mainPlace: 5,
            isWinner: false,
            challengeWins: null,
          },
        ],
      }),
    );
    expect(contestant.totalChallengeWins).toBe(0);
    expect(contestant.seasons[0].challengeWins).toBe(0);
  });

  it('maps extract queens list and ignores empty payload', () => {
    const extract: ContestantsExtractDto = {
      meta: {
        version: '3.0.0',
        generatedAt: '2026-10-30T00:00:00.000Z',
        source: 'https://example.com',
        queensCount: 1,
        lastUpdate: {
          seasonsProcessed: 1,
          seasonsEmpty: 0,
          seasonsFailed: 0,
          queensAdded: 1,
          queensFailed: 0,
          franchises: [{ franchise: "RuPaul's Drag Race", seasonCount: 1 }],
        },
      },
      queens: [makeQueen({ dragName: 'Mapped' })],
    };

    expect(mapContestantsExtract(extract)).toHaveLength(1);
    expect(mapContestantsExtract(extract)[0].dragName).toBe('Mapped');
    expect(mapContestantsExtract(null)).toEqual([]);
    expect(mapContestantsExtract(undefined)).toEqual([]);
  });
});
