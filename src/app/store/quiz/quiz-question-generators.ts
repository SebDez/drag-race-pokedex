import { FRANCHISE_NAMES, SEASONS_PER_FRANCHISE } from '../../contestants/constants/franchises';
import type { Contestant } from '../../contestants/models/contestant';
import { type QuizQuestion, QUIZ_LENGTH, QuizQuestionType } from './quiz.types';

export function shuffle<T>(arr: T[], random: () => number = Math.random): T[] {
  return [...arr].sort(() => random() - 0.5);
}

export function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function getWinners(contestants: Contestant[]): Contestant[] {
  return contestants.filter((c) => c.seasons?.some((s) => s.isWinner));
}

export function getFranchises(): string[] {
  return FRANCHISE_NAMES;
}

export function randomFromPool<T>(pool: T[], exclude: T[], howMany: number): T[] {
  const available = pool.filter((x) => !exclude.includes(x));
  return shuffle(available, Math.random).slice(0, howMany);
}

export function createWhoIsThisQueenQuestion(
  idx: number,
  allContestants: Contestant[],
): QuizQuestion {
  const contestantAnswer = randomItem(allContestants);
  const wrongAnswers = randomFromPool(allContestants, [contestantAnswer], 3);
  const options = shuffle([...wrongAnswers, contestantAnswer]).map((c) => c.dragName);
  return {
    id: `whoIs-${idx}`,
    type: QuizQuestionType.WhoIsThisQueen,
    contestant: contestantAnswer,
    options,
    answer: contestantAnswer.dragName,
  };
}

export function createFromWhichFranchiseQuestion(
  idx: number,
  allContestants: Contestant[],
): QuizQuestion {
  const contestantAnswer = randomItem(allContestants);

  const franchiseAnswer = contestantAnswer.firstFranchise;

  const allFranchises = getFranchises();
  const wrongAnswers = randomFromPool(allFranchises, [franchiseAnswer], 3);

  const options = shuffle([...wrongAnswers, franchiseAnswer]).map((f) => f);
  return {
    id: `fromWhichFranchise-${idx}`,
    type: QuizQuestionType.FromWhichFranchise,
    franchise: franchiseAnswer,
    contestant: contestantAnswer,
    options,
    answer: franchiseAnswer,
  };
}

export function createWhoWonSeasonQuestion(
  idx: number,
  allContestants: Contestant[],
): QuizQuestion {
  const allFranchises = getFranchises();
  const franchiseAnswer = randomItem(allFranchises);
  const seasonAnswer = randomItem(
    Array.from({ length: SEASONS_PER_FRANCHISE[franchiseAnswer] }, (_, i) => i + 1),
  );
  const contestantAnswer = allContestants.find((c) =>
    c.seasons?.some(
      (s) => s.franchise === franchiseAnswer && s.season === String(seasonAnswer) && s.isWinner,
    ),
  );
  if (!contestantAnswer) {
    return createWhoWonSeasonQuestion(idx, allContestants);
  }
  const wrongAnswers = randomFromPool(allContestants, [contestantAnswer], 3);
  const options = shuffle([...wrongAnswers, contestantAnswer]).map((c) => c.dragName);
  return {
    id: `whoWonSeason-${idx}`,
    type: QuizQuestionType.WhoWonSeason,
    franchise: franchiseAnswer,
    season: String(seasonAnswer),
    options,
    answer: franchiseAnswer,
  };
}

export function pickRandomQuestionType(): QuizQuestionType {
  const random = Math.random;
  const questionTypes = Object.values(QuizQuestionType);
  const index = Math.floor(random() * questionTypes.length);
  return questionTypes[index];
}

export function generateQuestions(allContestants: Contestant[]): QuizQuestion[] {
  const questionTypes: QuizQuestionType[] = [];

  for (let i = 0; i < QUIZ_LENGTH; i++) {
    const questionType = pickRandomQuestionType();
    questionTypes.push(questionType);
  }

  return questionTypes.map((type, idx) => {
    switch (type) {
      case QuizQuestionType.FromWhichFranchise:
        return createFromWhichFranchiseQuestion(idx, allContestants);
      case QuizQuestionType.WhoWonSeason:
        return createWhoWonSeasonQuestion(idx, allContestants);
      case QuizQuestionType.WhoIsThisQueen:
      default:
        return createWhoIsThisQueenQuestion(idx, allContestants);
    }
  });
}

export function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}
