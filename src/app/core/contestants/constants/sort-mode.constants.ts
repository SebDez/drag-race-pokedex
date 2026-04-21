export const SortMode = {
  DragNameAsc: 'dragNameAsc',
  ChallengeWinsDesc: 'challengeWinsDesc',
} as const;

export type ContestantSortMode = (typeof SortMode)[keyof typeof SortMode];
