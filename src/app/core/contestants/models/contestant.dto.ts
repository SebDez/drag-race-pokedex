/** Shape of `src/data/contestants_extract.json` (v3). */

export interface ContestantsExtractFranchiseStatDto {
  franchise: string;
  seasonCount: number;
}

export interface ContestantsExtractLastUpdateDto {
  seasonsProcessed: number;
  seasonsEmpty: number;
  seasonsFailed: number;
  queensAdded: number;
  queensFailed: number;
  franchises: ContestantsExtractFranchiseStatDto[];
}

export interface ContestantsExtractMetaDto {
  version: string;
  generatedAt: string;
  source: string;
  queensCount: number;
  lastUpdate: ContestantsExtractLastUpdateDto;
}

export interface SeasonDto {
  franchise: string;
  season: string;
  rawPlace: string;
  places: number[];
  mainPlace: number;
  isWinner: boolean;
  challengeWins: number | null;
}

export interface QueenDto {
  id: string;
  dragName: string;
  imageUrl: string;
  wikiUrl: string;
  seasons: SeasonDto[];
  firstFranchise: string;
  promoImageURL: string;
  totalChallengeWins: number | null;
  isWinner: boolean;
  firstFranchiseCountry: string;
}

export interface ContestantsExtractDto {
  meta: ContestantsExtractMetaDto;
  queens: QueenDto[];
}
