import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ContestantImageComponent } from '@app/shared/ui/contestant-image/contestant-image.component';
import { QuizStore } from '@app/core/quiz/store/quiz.store';

const FEEDBACK_MS_OK = 5000;
const FEEDBACK_MS_KO = 10000;
const TICK_MS = 50;

@Component({
  selector: 'app-quiz-feedback',
  standalone: true,
  imports: [TranslateModule, ContestantImageComponent],
  templateUrl: './quiz-feedback.component.html',
  styleUrl: './quiz-feedback.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizFeedbackComponent {
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly progress = signal(0);
  protected readonly titleText = signal('');

  private timerId: ReturnType<typeof setInterval> | null = null;
  private startedAt = 0;
  private durationMs = FEEDBACK_MS_OK;
  private advanced = false;

  protected readonly isCorrect = computed(() => this.store.lastAnswer()?.correct === true);

  protected readonly pointsGained = computed(() => this.store.lastAnswer()?.points ?? 0);

  protected readonly userAnswerLabel = computed(() => {
    const answer = this.store.lastAnswer()?.userAnswer?.trim();
    return answer || this.translate.instant('quiz.recap.emptyAnswer');
  });

  protected readonly correctAnswerLabel = computed(() => {
    const question = this.store.currentQuestion();
    if (!question) {
      return '';
    }
    return question.correctAnswers.join(' / ');
  });

  protected readonly userAnswerImage = computed(() => {
    const question = this.store.currentQuestion();
    const answer = this.store.lastAnswer()?.userAnswer?.trim() ?? '';
    if (!question || !answer) {
      return '';
    }
    return question.answerImages[answer] ?? '';
  });

  protected readonly correctAnswerImage = computed(() => {
    const question = this.store.currentQuestion();
    const primary = question?.correctAnswers[0];
    if (!question || !primary) {
      return '';
    }
    return question.answerImages[primary] ?? '';
  });

  protected readonly answerObjectFit = computed<'cover' | 'contain'>(() =>
    this.store.currentQuestion()?.type === 'firstFranchise' ? 'contain' : 'cover',
  );

  constructor(protected readonly store: QuizStore) {
    this.bootstrapFeedback();
    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  protected onContinue(): void {
    this.advance();
  }

  private bootstrapFeedback(): void {
    const answer = this.store.lastAnswer();
    if (!answer) {
      return;
    }

    this.durationMs = answer.correct ? FEEDBACK_MS_OK : FEEDBACK_MS_KO;
    this.titleText.set(this.pickTitle(answer.correct));
    this.progress.set(0);
    this.startedAt = Date.now();
    this.startTimer();
  }

  private pickTitle(correct: boolean): string {
    const key = correct
      ? 'quiz.feedback.successTitles'
      : 'quiz.feedback.failTitles';
    const titles = this.translate.instant(key);
    if (Array.isArray(titles) && titles.length > 0) {
      const index = Math.floor(Math.random() * titles.length);
      return String(titles[index]);
    }
    return correct
      ? this.translate.instant('quiz.recap.vibeHigh')
      : this.translate.instant('quiz.recap.vibeLow');
  }

  private startTimer(): void {
    this.clearTimer();
    this.timerId = setInterval(() => {
      const elapsed = Date.now() - this.startedAt;
      const ratio = Math.min(1, elapsed / this.durationMs);
      this.progress.set(ratio * 100);
      if (ratio >= 1) {
        this.advance();
      }
    }, TICK_MS);
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private advance(): void {
    if (this.advanced) {
      return;
    }
    this.advanced = true;
    this.clearTimer();
    this.store.continueAfterFeedback();
  }
}
