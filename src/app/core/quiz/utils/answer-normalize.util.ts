/** Normalize free-text answers for tolerant cash matching. */
export function normalizeAnswer(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function answersMatch(userAnswer: string, correctAnswers: string[]): boolean {
  const normalizedUser = normalizeAnswer(userAnswer);
  if (!normalizedUser) {
    return false;
  }
  return correctAnswers.some((correct) => normalizeAnswer(correct) === normalizedUser);
}
