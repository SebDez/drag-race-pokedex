import { Injectable, computed, inject, signal } from '@angular/core';
import { ContestantsStore } from '../contestants/contestants.store';
import {
  type QuizState,
  type QuizQuestion,
  type QuizAnswerResult,
  QUIZ_LENGTH,
  QuizAnswerMode,
  QuizStatus,
  QuizAnswerPoints,
} from './quiz.types';
import { generateQuestions, normalizeText } from './quiz-question-generators';

@Injectable({ providedIn: 'root' })
export class QuizStore {
  private readonly contestantsStore = inject(ContestantsStore);

  private readonly state = signal<QuizState>({
    questions: [],
    currentIndex: 0,
    totalQuestions: QUIZ_LENGTH,
    score: 0,
    answers: [],
    status: QuizStatus.Idle,
  });

  readonly questions = computed<QuizQuestion[]>(() => this.state().questions);
  readonly currentIndex = computed<number>(() => this.state().currentIndex);
  readonly totalQuestions = computed<number>(() => this.state().totalQuestions);
  readonly score = computed<number>(() => this.state().score);
  readonly answers = computed<QuizAnswerResult[]>(() => this.state().answers);
  readonly status = computed<QuizStatus>(() => this.state().status);

  readonly currentQuestion = computed<QuizQuestion | undefined>(() => {
    const { questions, currentIndex } = this.state();
    return questions[currentIndex] ?? undefined;
  });

  reset(): void {
    this.state.set({
      questions: [],
      currentIndex: 0,
      totalQuestions: QUIZ_LENGTH,
      score: 0,
      answers: [],
      status: QuizStatus.Idle,
    });
  }

  startNewQuiz(): void {
    const contestants = this.contestantsStore.contestants();
    if (!contestants.length) {
      this.contestantsStore.loadContestants();
      return;
    }

    const questions = generateQuestions(contestants);
    this.state.set({
      questions,
      currentIndex: 0,
      totalQuestions: questions.length,
      score: 0,
      answers: [],
      status: QuizStatus.InProgress,
    });
  }

  submitAnswer(selectedMode: QuizAnswerMode, userAnswer: string): void {
    const currentQuestion = this.currentQuestion();
    if (!currentQuestion || this.state().status !== QuizStatus.InProgress) {
      return;
    }

    const normalizedUserResponse = normalizeText(userAnswer);
    const correctAnswer = currentQuestion.answer;
    const isCorrect = currentQuestion.answer === normalizedUserResponse;

    let pointsWon = 0;
    if (isCorrect) {
      switch (selectedMode) {
        case QuizAnswerMode.Square:
          pointsWon = QuizAnswerPoints[QuizAnswerMode.Square];
          break;
        case QuizAnswerMode.Duo:
          pointsWon = QuizAnswerPoints[QuizAnswerMode.Duo];
          break;
        case QuizAnswerMode.Cash:
          pointsWon = QuizAnswerPoints[QuizAnswerMode.Cash];
          break;
        default:
          pointsWon = 0;
          break;
      }
    }

    const result: QuizAnswerResult = {
      questionId: currentQuestion.id,
      selectedMode,
      isCorrect,
      correctAnswer,
      userAnswer,
      pointsWon,
    };

    const prev = this.state();
    const nextAnswers = [...prev.answers, result];
    const nextScore = prev.score + pointsWon;
    const nextIndex = prev.currentIndex + 1;
    const isFinished = nextIndex >= prev.totalQuestions;

    this.state.set({
      ...prev,
      answers: nextAnswers,
      score: nextScore,
      currentIndex: isFinished ? prev.currentIndex : nextIndex,
      status: isFinished ? QuizStatus.Finished : prev.status,
    });
  }
}
