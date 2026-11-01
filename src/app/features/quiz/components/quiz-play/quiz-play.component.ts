import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Injector,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ContestantImageComponent } from '@app/shared/ui/contestant-image/contestant-image.component';
import {
  ANSWER_MODE_EMOJI,
  ANSWER_MODE_POINTS,
  type AnswerMode,
} from '@app/core/quiz/models/quiz.model';
import { QuizStore } from '@app/core/quiz/store/quiz.store';
import { normalizeAnswer } from '@app/core/quiz/utils/answer-normalize.util';

const MAX_CASH_RESULTS = 12;

@Component({
  selector: 'app-quiz-play',
  standalone: true,
  imports: [TranslateModule, FormsModule, ContestantImageComponent],
  templateUrl: './quiz-play.component.html',
  styleUrl: './quiz-play.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizPlayComponent {
  private readonly cashInput = viewChild<ElementRef<HTMLInputElement>>('cashInput');

  protected readonly cashQuery = signal('');
  protected readonly lightboxOpen = signal(false);
  protected readonly modePoints = ANSWER_MODE_POINTS;
  protected readonly modeEmoji = ANSWER_MODE_EMOJI;
  protected readonly modes: AnswerMode[] = ['duo', 'square', 'cash'];

  protected readonly options = computed(() => {
    const question = this.store.currentQuestion();
    const mode = this.store.selectedMode();
    if (!question || !mode || mode === 'cash') {
      return [];
    }
    return mode === 'duo' ? question.duoOptions : question.squareOptions;
  });

  protected readonly lockedModeLabel = computed(() => {
    const mode = this.store.selectedMode();
    if (!mode) {
      return '';
    }
    const short = this.translate.instant('quiz.modes.' + mode + '.short');
    return `${ANSWER_MODE_EMOJI[mode]} ${short}`;
  });

  protected readonly cashResults = computed(() => {
    const question = this.store.currentQuestion();
    if (!question || this.store.selectedMode() !== 'cash') {
      return [];
    }

    const draft = normalizeAnswer(this.cashQuery());
    if (draft.length < 1) {
      return [];
    }

    return question.cashSuggestions
      .filter((suggestion) => normalizeAnswer(suggestion).includes(draft))
      .slice(0, MAX_CASH_RESULTS);
  });

  protected readonly showCashEmpty = computed(() => {
    return (
      this.store.selectedMode() === 'cash' &&
      normalizeAnswer(this.cashQuery()).length >= 1 &&
      this.cashResults().length === 0
    );
  });

  constructor(
    protected readonly store: QuizStore,
    private readonly translate: TranslateService,
    private readonly injector: Injector,
  ) {}

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.lightboxOpen()) {
      this.closeLightbox();
    }
  }

  protected onQuit(): void {
    const message = this.translate.instant('quiz.play.quitConfirm');
    if (typeof window !== 'undefined' && !window.confirm(message)) {
      return;
    }
    this.closeLightbox();
    this.cashQuery.set('');
    this.store.backToSetup();
  }

  protected openLightbox(): void {
    this.lightboxOpen.set(true);
  }

  protected closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  protected onSelectMode(mode: AnswerMode): void {
    this.cashQuery.set('');
    this.store.selectMode(mode);
    if (mode !== 'cash') {
      return;
    }
    afterNextRender(
      () => {
        this.cashInput()?.nativeElement.focus();
      },
      { injector: this.injector },
    );
  }

  protected onSelectOption(option: string): void {
    this.closeLightbox();
    this.store.submitAnswer(option);
    this.cashQuery.set('');
  }

  protected onSelectCash(option: string): void {
    this.closeLightbox();
    this.store.submitAnswer(option);
    this.cashQuery.set('');
  }
}
