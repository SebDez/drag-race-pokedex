export interface Season {
  franchise: string;
  season: string;
  rawPlace: string;
  places: number[];
  mainPlace: number;
  isWinner: boolean;
  challengeWins: number;
}

export interface Contestant {
  dragName: string;
  imageUrl: string;
  wikiUrl: string;
  seasons: Season[];
  firstFranchise: string;
  miniPromoImageUrl: string;
  totalChallengeWins: number;
  isWinner: boolean;
  firstFranchiseCountry: string;
}
