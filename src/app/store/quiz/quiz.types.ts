import { Contestant } from '../../contestants/models/contestant';

export const QUIZ_LENGTH = 10;

export const QuizQuestionType = {
  WhoIsThisQueen: 'whoIsThisQueen',
  FromWhichFranchise: 'fromWhichFranchise',
  WhoWonSeason: 'whoWonSeason',
} as const;

export type QuizQuestionType = (typeof QuizQuestionType)[keyof typeof QuizQuestionType];

export const QuizAnswerMode = {
  Square: 'square',
  Duo: 'duo',
  Cash: 'cash',
} as const;

export type QuizAnswerMode = (typeof QuizAnswerMode)[keyof typeof QuizAnswerMode];

export const QuizAnswerPoints = {
  [QuizAnswerMode.Square]: 5,
  [QuizAnswerMode.Duo]: 2,
  [QuizAnswerMode.Cash]: 10,
} as const;

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  contestant?: Contestant;
  franchise?: string;
  season?: string;
  answer: string;
  options: string[];
}

export interface QuizAnswerResult {
  questionId: string;
  isCorrect: boolean;
  selectedMode: QuizAnswerMode;
  pointsWon: number;
  correctAnswer: string;
  userAnswer: string;
}

export const QuizStatus = {
  Idle: 'idle',
  InProgress: 'inProgress',
  Finished: 'finished',
} as const;

export type QuizStatus = (typeof QuizStatus)[keyof typeof QuizStatus];

export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  totalQuestions: number;
  score: number;
  answers: QuizAnswerResult[];
  status: QuizStatus;
}
