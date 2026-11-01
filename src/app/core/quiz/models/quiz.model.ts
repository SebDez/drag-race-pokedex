export const QUIZ_QUESTION_TYPES = ['whoIsThis', 'firstFranchise', 'seasonWinner'] as const;
export type QuizQuestionType = (typeof QUIZ_QUESTION_TYPES)[number];

export const ANSWER_MODES = ['duo', 'square', 'cash'] as const;
export type AnswerMode = (typeof ANSWER_MODES)[number];

/** Fixed length for every quiz (quick + custom). */
export const QUIZ_QUESTION_COUNT = 10;

export type QuizPhase = 'setup' | 'playing' | 'recap';

export const ANSWER_MODE_POINTS: Record<AnswerMode, number> = {
  duo: 2,
  square: 5,
  cash: 10,
};

export const ANSWER_MODE_EMOJI: Record<AnswerMode, string> = {
  duo: '✌️',
  square: '💅',
  cash: '👑',
};

/** Max score = 10 questions × 10 cash points. */
export const QUIZ_MAX_SCORE = QUIZ_QUESTION_COUNT * ANSWER_MODE_POINTS.cash;

export interface QuizConfig {
  questionCount: typeof QUIZ_QUESTION_COUNT;
  /** Empty = all franchises */
  franchises: string[];
}

export interface QuizAnswerWiki {
  name: string;
  wikiUrl: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  imageUrl: string | null;
  promptKey: string;
  promptParams: Record<string, string>;
  correctAnswers: string[];
  /** Wiki of the related queen(s) — always tied to a contestant, even if the answer is a franchise. */
  correctAnswerWikis: QuizAnswerWiki[];
  duoOptions: string[];
  squareOptions: string[];
  /** Pool for cash autocomplete (names or franchises). */
  cashSuggestions: string[];
}

export interface QuizAnswerRecord {
  questionId: string;
  mode: AnswerMode;
  userAnswer: string;
  correct: boolean;
  points: number;
  maxPoints: number;
}

export interface QuizPrefs {
  franchises: string[];
}

export interface QuizRecapItem {
  question: QuizQuestion;
  answer: QuizAnswerRecord;
}
