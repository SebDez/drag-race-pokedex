import type { Contestant, Season } from '../models/contestant.model';
import type {
  ContestantsExtractDto,
  QueenDto,
  SeasonDto,
} from '../models/contestant.dto';

export function mapSeasonDto(dto: SeasonDto): Season {
  return {
    franchise: dto.franchise,
    season: dto.season,
    rawPlace: dto.rawPlace,
    places: dto.places ?? [],
    mainPlace: dto.mainPlace,
    isWinner: dto.isWinner,
    challengeWins: dto.challengeWins ?? 0,
  };
}

export function mapQueenDto(dto: QueenDto): Contestant {
  return {
    dragName: dto.dragName,
    imageUrl: dto.imageUrl ?? '',
    wikiUrl: dto.wikiUrl ?? '',
    seasons: (dto.seasons ?? []).map(mapSeasonDto),
    firstFranchise: dto.firstFranchise,
    miniPromoImageUrl: dto.promoImageURL ?? '',
    totalChallengeWins: dto.totalChallengeWins ?? 0,
    isWinner: dto.isWinner,
    firstFranchiseCountry: dto.firstFranchiseCountry ?? '',
  };
}

export function mapContestantsExtract(dto: ContestantsExtractDto | null | undefined): Contestant[] {
  return (dto?.queens ?? []).map(mapQueenDto);
}
