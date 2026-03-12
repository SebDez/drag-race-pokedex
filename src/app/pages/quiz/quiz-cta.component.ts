import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { QuizStore } from '../../store/quiz/quiz.store';

@Component({
  selector: 'app-quiz-cta',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './quiz-cta.component.html',
})
export class QuizCtaComponent {
  protected readonly store = inject(QuizStore);

  protected onPlay(): void {
    this.store.startNewQuiz();
  }
}

