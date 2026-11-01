import type { Contestant } from '@app/core/contestants/models/contestant.model';
import type {
  QuizAnswerWiki,
  QuizConfig,
  QuizQuestion,
  QuizQuestionType,
} from '../models/quiz.model';
import { QUIZ_QUESTION_TYPES } from '../models/quiz.model';

interface SeasonWinnerCandidate {
  franchise: string;
  season: string;
  winners: string[];
  imageUrl: string | null;
}

function wikiEntry(c: Contestant): QuizAnswerWiki | null {
  const wikiUrl = (c.wikiUrl ?? '').trim();
  if (!wikiUrl) {
    return null;
  }
  return { name: c.dragName, wikiUrl };
}

function wikisForNames(pool: Contestant[], names: string[]): QuizAnswerWiki[] {
  const wanted = new Set(names);
  const byName = new Map<string, QuizAnswerWiki>();
  for (const c of pool) {
    if (!wanted.has(c.dragName) || byName.has(c.dragName)) {
      continue;
    }
    const entry = wikiEntry(c);
    if (entry) {
      byName.set(c.dragName, entry);
    }
  }
  return names.map((name) => byName.get(name)).filter((e): e is QuizAnswerWiki => !!e);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) {
    return undefined;
  }
  return items[Math.floor(Math.random() * items.length)];
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter((v) => v.trim().length > 0))];
}

/** Prefer main imageUrl — mini promos often print the queen's name on the photo. */
function contestantImage(c: Contestant): string | null {
  return c.imageUrl || c.miniPromoImageUrl || null;
}

/** Queens who competed in at least one of the selected franchises (or all if empty). */
function filterContestants(all: Contestant[], franchises: string[]): Contestant[] {
  if (franchises.length === 0) {
    return all;
  }
  const set = new Set(franchises);
  return all.filter((c) => c.seasons.some((s) => set.has(s.franchise)));
}

function buildSeasonWinners(
  pool: Contestant[],
  franchises: string[],
): SeasonWinnerCandidate[] {
  const allowed =
    franchises.length === 0 ? null : new Set(franchises);
  const byKey = new Map<string, SeasonWinnerCandidate>();

  for (const c of pool) {
    for (const season of c.seasons) {
      if (!season.isWinner) {
        continue;
      }
      if (allowed && !allowed.has(season.franchise)) {
        continue;
      }
      const key = `${season.franchise}::${season.season}`;
      const existing = byKey.get(key);
      if (existing) {
        if (!existing.winners.includes(c.dragName)) {
          existing.winners.push(c.dragName);
        }
        if (!existing.imageUrl) {
          existing.imageUrl = contestantImage(c);
        }
      } else {
        byKey.set(key, {
          franchise: season.franchise,
          season: season.season,
          winners: [c.dragName],
          imageUrl: contestantImage(c),
        });
      }
    }
  }

  return [...byKey.values()];
}

function buildOptions(
  correct: string,
  distractorPool: string[],
  count: number,
): string[] | null {
  const distractors = shuffle(
    uniqueStrings(distractorPool).filter((d) => d !== correct),
  ).slice(0, count - 1);

  if (distractors.length < count - 1) {
    return null;
  }

  return shuffle([correct, ...distractors]);
}

function createWhoIsThis(
  target: Contestant,
  namePool: string[],
  id: string,
): QuizQuestion | null {
  const correct = target.dragName;
  const duoOptions = buildOptions(correct, namePool, 2);
  const squareOptions = buildOptions(correct, namePool, 4);
  if (!duoOptions) {
    return null;
  }
  const wiki = wikiEntry(target);
  return {
    id,
    type: 'whoIsThis',
    imageUrl: contestantImage(target),
    promptKey: 'quiz.questions.whoIsThis',
    promptParams: {},
    correctAnswers: [correct],
    correctAnswerWikis: wiki ? [wiki] : [],
    duoOptions,
    squareOptions: squareOptions ?? duoOptions,
    cashSuggestions: namePool,
  };
}

function createFirstFranchise(
  target: Contestant,
  franchisePool: string[],
  id: string,
): QuizQuestion | null {
  const correct = target.firstFranchise;
  const duoOptions = buildOptions(correct, franchisePool, 2);
  const squareOptions = buildOptions(correct, franchisePool, 4);
  if (!duoOptions) {
    return null;
  }
  const wiki = wikiEntry(target);
  return {
    id,
    type: 'firstFranchise',
    imageUrl: contestantImage(target),
    promptKey: 'quiz.questions.firstFranchise',
    promptParams: {},
    correctAnswers: [correct],
    // Wiki of the pictured queen (answer itself is a franchise name).
    correctAnswerWikis: wiki ? [wiki] : [],
    duoOptions,
    squareOptions: squareOptions ?? duoOptions,
    cashSuggestions: franchisePool,
  };
}

/** Queens who competed on a given franchise (optionally a specific season). */
function namesInFranchise(
  pool: Contestant[],
  franchise: string,
  season?: string,
): string[] {
  return uniqueStrings(
    pool
      .filter((c) =>
        c.seasons.some(
          (s) =>
            s.franchise === franchise &&
            (season === undefined || s.season === season),
        ),
      )
      .map((c) => c.dragName),
  );
}

/**
 * Build N options for a season-winner question.
 * Prefer same-season queens, then same-franchise only — never other franchises.
 */
function buildSeasonWinnerOptions(
  correctAnswers: string[],
  seasonPool: string[],
  franchisePool: string[],
  count: number,
): string[] | null {
  const primary = correctAnswers[0];
  if (!primary) {
    return null;
  }
  const exclude = new Set(correctAnswers);
  const preferred = shuffle(seasonPool.filter((d) => !exclude.has(d)));
  const distractors = [...preferred];
  const needed = count - 1;

  if (distractors.length < needed) {
    const fallback = shuffle(
      franchisePool.filter((d) => !exclude.has(d) && !distractors.includes(d)),
    );
    distractors.push(...fallback.slice(0, needed - distractors.length));
  }

  if (distractors.length < needed) {
    return null;
  }

  return shuffle([primary, ...distractors.slice(0, needed)]);
}

function createSeasonWinner(
  candidate: SeasonWinnerCandidate,
  pool: Contestant[],
  id: string,
): QuizQuestion | null {
  const seasonPool = namesInFranchise(pool, candidate.franchise, candidate.season);
  const franchisePool = namesInFranchise(pool, candidate.franchise);
  const duoOptions = buildSeasonWinnerOptions(
    candidate.winners,
    seasonPool,
    franchisePool,
    2,
  );
  const squareOptions = buildSeasonWinnerOptions(
    candidate.winners,
    seasonPool,
    franchisePool,
    4,
  );
  if (!duoOptions) {
    return null;
  }
  return {
    id,
    type: 'seasonWinner',
    imageUrl: null,
    promptKey: 'quiz.questions.seasonWinner',
    promptParams: {
      season: candidate.season,
      franchise: candidate.franchise,
    },
    correctAnswers: [...candidate.winners],
    correctAnswerWikis: wikisForNames(pool, candidate.winners),
    duoOptions,
    squareOptions: squareOptions ?? duoOptions,
    cashSuggestions: franchisePool,
  };
}

function nextType(index: number): QuizQuestionType {
  return QUIZ_QUESTION_TYPES[index % QUIZ_QUESTION_TYPES.length];
}

/**
 * Builds a shuffled quiz from local contestant data.
 * Falls back across types when a pool is too small for a given question.
 */
export function generateQuizQuestions(
  allContestants: Contestant[],
  config: QuizConfig,
): QuizQuestion[] {
  const pool = filterContestants(allContestants, config.franchises);
  if (pool.length < 2) {
    return [];
  }

  // Duo / square / cash options stay inside the selected franchise pool.
  const namePool = uniqueStrings(pool.map((c) => c.dragName));
  const franchisePool =
    config.franchises.length > 0
      ? uniqueStrings(config.franchises)
      : uniqueStrings(pool.map((c) => c.firstFranchise));
  const winners = buildSeasonWinners(pool, config.franchises);

  const whoCandidates = shuffle(pool.filter((c) => !!contestantImage(c)));
  const franchiseCandidates = shuffle(
    pool.filter((c) => !!contestantImage(c) && !!c.firstFranchise),
  );
  const winnerCandidates = shuffle(winners);

  let whoIdx = 0;
  let franchiseIdx = 0;
  let winnerIdx = 0;
  const usedWho = new Set<string>();
  const usedFranchise = new Set<string>();
  const usedWinner = new Set<string>();

  const questions: QuizQuestion[] = [];
  let attempt = 0;
  const maxAttempts = config.questionCount * 8;

  while (questions.length < config.questionCount && attempt < maxAttempts) {
    const preferred = nextType(questions.length + attempt);
    const tryOrder: QuizQuestionType[] = [
      preferred,
      ...QUIZ_QUESTION_TYPES.filter((t) => t !== preferred),
    ];

    let created: QuizQuestion | null = null;

    for (const type of tryOrder) {
      if (type === 'whoIsThis') {
        while (whoIdx < whoCandidates.length && !created) {
          const target = whoCandidates[whoIdx++];
          if (usedWho.has(target.dragName)) {
            continue;
          }
          const q = createWhoIsThis(
            target,
            namePool,
            `q-${questions.length}-who`,
          );
          if (q) {
            usedWho.add(target.dragName);
            created = q;
          }
        }
      } else if (type === 'firstFranchise') {
        while (franchiseIdx < franchiseCandidates.length && !created) {
          const target = franchiseCandidates[franchiseIdx++];
          if (usedFranchise.has(target.dragName)) {
            continue;
          }
          if (franchisePool.length < 2) {
            break;
          }
          const q = createFirstFranchise(
            target,
            franchisePool,
            `q-${questions.length}-fr`,
          );
          if (q) {
            usedFranchise.add(target.dragName);
            created = q;
          }
        }
      } else {
        while (winnerIdx < winnerCandidates.length && !created) {
          const candidate = winnerCandidates[winnerIdx++];
          const key = `${candidate.franchise}::${candidate.season}`;
          if (usedWinner.has(key)) {
            continue;
          }
          const q = createSeasonWinner(
            candidate,
            pool,
            `q-${questions.length}-win`,
          );
          if (q) {
            usedWinner.add(key);
            created = q;
          }
        }
      }

      if (created) {
        break;
      }
    }

    attempt++;
    if (created) {
      questions.push(created);
    } else {
      break;
    }
  }

  return questions;
}

/** Exposed for tests / edge cases */
export function pickRandomContestant(pool: Contestant[]): Contestant | undefined {
  return pickRandom(pool);
}
