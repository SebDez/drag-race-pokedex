import { Contestant } from '../contestants/models/contestant';

export function createContestant(overrides: Partial<Contestant> = {}): Contestant {
  return {
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
    miniPromoImageUrl: 'https://example.com/promo.jpg',
    totalChallengeWins: 2,
    isWinner: true,
    firstFranchiseCountry: 'United States',
    ...overrides,
  };
}
