import { Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { QuizAnswerMode } from '../../../store/quiz/quiz.types';

@Component({
  selector: 'app-quiz-mode-cta',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './quiz-mode-cta.component.html',
})
export class QuizModeCtaComponent {
  readonly mode = input<QuizAnswerMode>(QuizAnswerMode.Square);
  readonly modeSelected = output<QuizAnswerMode>();
}
