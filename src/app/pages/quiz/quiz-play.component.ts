import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QuizStore } from '../../store/quiz/quiz.store';
import { QuizQuestion, QuizAnswerMode, QuizQuestionType } from '../../store/quiz/quiz.types';
import { QuizModeCtaComponent } from './quiz-mode-cta/quiz-mode-cta.component';

@Component({
  selector: 'app-quiz-play',
  standalone: true,
  imports: [NgClass, FormsModule, TranslateModule, QuizModeCtaComponent],
  templateUrl: './quiz-play.component.html',
})
export class QuizPlayComponent {
  protected readonly store = inject(QuizStore);

  protected answerMode: QuizAnswerMode | null = null;
  protected selectedOptionId: string | null = null;
  protected cashValue = '';
  protected quizQuestionType = QuizQuestionType;
  protected quizAnswerMode = QuizAnswerMode;

  protected get currentQuestion(): QuizQuestion | undefined {
    return this.store.currentQuestion();
  }

  protected onSelectMode(mode: QuizAnswerMode): void {
    this.answerMode = mode;
    this.selectedOptionId = null;
    this.cashValue = '';
  }

  protected onSelectOption(value: string): void {
    this.selectedOptionId = value;
  }

  protected onSubmit(): void {
    const question = this.currentQuestion;
    const mode = this.answerMode;
    if (!question || !mode) return;

    let userResponse;
    if (mode === QuizAnswerMode.Cash) {
      userResponse = this.cashValue;
      if (!userResponse.trim()) return;
    } else {
      if (!this.selectedOptionId) return;
      userResponse = this.selectedOptionId;
    }

    this.store.submitAnswer(mode, userResponse);
    this.answerMode = null;
    this.selectedOptionId = null;
    this.cashValue = '';
  }
}
