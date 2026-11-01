/** Shape of `src/data/contestants_extract.json` (v2). */

export interface ContestantsExtractLastUpdateDto {
  franchise: string;
  season: string;
  seasonPage: string;
  added: number;
  updated: number;
  skipped: number;
  failed: number;
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
