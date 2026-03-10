export const GroupMode = {
  All: 'all',
  Alphabetical: 'alphabetical',
  Franchise: 'franchise',
} as const;

export type ContestantGroupMode = (typeof GroupMode)[keyof typeof GroupMode];
