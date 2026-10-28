import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { QuizStore } from '@app/core/quiz/store/quiz.store';

@Component({
  selector: 'app-quiz-recap',
  standalone: true,
  imports: [TranslateModule, RouterLink],
  templateUrl: './quiz-recap.component.html',
  styleUrl: './quiz-recap.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizRecapComponent {
  protected readonly lightboxUrl = signal<string | null>(null);

  protected readonly scoreRatio = computed(() => {
    const max = this.store.maxScore();
    if (max <= 0) {
      return 0;
    }
    return this.store.score() / max;
  });

  protected readonly vibeKey = computed(() => {
    const ratio = this.scoreRatio();
    if (ratio >= 0.8) {
      return 'quiz.recap.vibeHigh';
    }
    if (ratio >= 0.45) {
      return 'quiz.recap.vibeMid';
    }
    return 'quiz.recap.vibeLow';
  });

  constructor(protected readonly store: QuizStore) {}

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.lightboxUrl()) {
      this.closeLightbox();
    }
  }

  protected onReplay(): void {
    this.closeLightbox();
    this.store.replay();
  }

  protected onBackToSetup(): void {
    this.closeLightbox();
    this.store.backToSetup();
  }

  protected openLightbox(url: string): void {
    this.lightboxUrl.set(url);
  }

  protected closeLightbox(): void {
    this.lightboxUrl.set(null);
  }

  protected correctLabel(answers: string[]): string {
    return answers.join(' / ');
  }
}
