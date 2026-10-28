import { Inject, Injectable, computed, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import {
  ANSWER_MODE_POINTS,
  QUIZ_MAX_SCORE,
  QUIZ_QUESTION_COUNT,
  type AnswerMode,
  type QuizAnswerRecord,
  type QuizConfig,
  type QuizPhase,
  type QuizQuestion,
  type QuizRecapItem,
} from '../models/quiz.model';
import { QUIZ_DATA_PROVIDER, QuizDataProvider } from '../providers/quiz.provider';
import { QuizPrefsService } from '../services/quiz-prefs.service';
import { answersMatch } from '../utils/answer-normalize.util';

@Injectable({ providedIn: 'root' })
export class QuizStore {
  private readonly phaseSignal = signal<QuizPhase>('setup');
  private readonly questionsSignal = signal<QuizQuestion[]>([]);
  private readonly currentIndexSignal = signal(0);
  private readonly answersSignal = signal<QuizAnswerRecord[]>([]);
  private readonly selectedModeSignal = signal<AnswerMode | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly lastConfigSignal = signal<QuizConfig | null>(null);
  private readonly customFranchisesSignal = signal<string[]>([]);
  private readonly showCustomSignal = signal(false);

  readonly phase = this.phaseSignal.asReadonly();
  readonly questions = this.questionsSignal.asReadonly();
  readonly currentIndex = this.currentIndexSignal.asReadonly();
  readonly answers = this.answersSignal.asReadonly();
  readonly selectedMode = this.selectedModeSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly lastConfig = this.lastConfigSignal.asReadonly();
  readonly customFranchises = this.customFranchisesSignal.asReadonly();
  readonly showCustom = this.showCustomSignal.asReadonly();

  readonly currentQuestion = computed(() => {
    const list = this.questionsSignal();
    const index = this.currentIndexSignal();
    return list[index] ?? null;
  });

  readonly totalQuestions = computed(() => this.questionsSignal().length);

  readonly progressLabel = computed(() => {
    const total = this.totalQuestions();
    if (total === 0) {
      return '';
    }
    return `${this.currentIndexSignal() + 1} / ${total}`;
  });

  readonly score = computed(() =>
    this.answersSignal().reduce((sum, a) => sum + a.points, 0),
  );

  readonly maxScore = computed(() => QUIZ_MAX_SCORE);

  readonly recapItems = computed<QuizRecapItem[]>(() => {
    const byId = new Map(this.answersSignal().map((a) => [a.questionId, a]));
    return this.questionsSignal()
      .map((question) => {
        const answer = byId.get(question.id);
        return answer ? { question, answer } : null;
      })
      .filter((item): item is QuizRecapItem => item !== null);
  });

  readonly correctCount = computed(
    () => this.answersSignal().filter((a) => a.correct).length,
  );

  constructor(
    @Inject(QUIZ_DATA_PROVIDER) private readonly provider: QuizDataProvider,
    private readonly prefs: QuizPrefsService,
  ) {
    const stored = this.prefs.load();
    this.customFranchisesSignal.set(stored.franchises);
  }

  setShowCustom(show: boolean): void {
    this.showCustomSignal.set(show);
  }

  setCustomFranchises(franchises: string[]): void {
    this.customFranchisesSignal.set(franchises);
    this.persistCustomPrefs();
  }

  toggleFranchise(franchise: string): void {
    const current = this.customFranchisesSignal();
    const next = current.includes(franchise)
      ? current.filter((f) => f !== franchise)
      : [...current, franchise];
    this.setCustomFranchises(next);
  }

  startQuick(): void {
    this.startQuiz({ questionCount: QUIZ_QUESTION_COUNT, franchises: [] });
  }

  startCustom(): void {
    this.startQuiz({
      questionCount: QUIZ_QUESTION_COUNT,
      franchises: this.customFranchisesSignal(),
    });
  }

  replay(): void {
    const config = this.lastConfigSignal();
    if (config) {
      this.startQuiz({ ...config, questionCount: QUIZ_QUESTION_COUNT });
    } else {
      this.backToSetup();
    }
  }

  backToSetup(): void {
    this.phaseSignal.set('setup');
    this.questionsSignal.set([]);
    this.currentIndexSignal.set(0);
    this.answersSignal.set([]);
    this.selectedModeSignal.set(null);
    this.errorSignal.set(null);
    this.loadingSignal.set(false);
  }

  selectMode(mode: AnswerMode): void {
    if (this.phaseSignal() !== 'playing') {
      return;
    }
    if (this.selectedModeSignal() !== null) {
      return;
    }
    this.selectedModeSignal.set(mode);
  }

  submitAnswer(rawAnswer: string): void {
    const mode = this.selectedModeSignal();
    const question = this.currentQuestion();
    if (!mode || !question || this.phaseSignal() !== 'playing') {
      return;
    }

    const userAnswer = rawAnswer.trim();
    const correct = answersMatch(userAnswer, question.correctAnswers);
    const maxPoints = ANSWER_MODE_POINTS[mode];
    const record: QuizAnswerRecord = {
      questionId: question.id,
      mode,
      userAnswer,
      correct,
      points: correct ? maxPoints : 0,
      maxPoints,
    };

    this.answersSignal.update((list) => [...list, record]);
    this.selectedModeSignal.set(null);

    const nextIndex = this.currentIndexSignal() + 1;
    if (nextIndex >= this.questionsSignal().length) {
      this.phaseSignal.set('recap');
      return;
    }
    this.currentIndexSignal.set(nextIndex);
  }

  private startQuiz(config: QuizConfig): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.lastConfigSignal.set(config);
    this.answersSignal.set([]);
    this.selectedModeSignal.set(null);
    this.currentIndexSignal.set(0);

    this.provider
      .generateQuestions(config)
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (questions) => {
          if (questions.length === 0) {
            this.errorSignal.set('quiz.errors.noQuestions');
            this.phaseSignal.set('setup');
            return;
          }
          this.questionsSignal.set(questions);
          this.phaseSignal.set('playing');
        },
        error: () => {
          this.errorSignal.set('quiz.errors.loadFailed');
          this.phaseSignal.set('setup');
        },
      });
  }

  private persistCustomPrefs(): void {
    this.prefs.save({
      franchises: this.customFranchisesSignal(),
    });
  }
}
