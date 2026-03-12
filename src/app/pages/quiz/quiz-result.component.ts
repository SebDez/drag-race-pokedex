import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { QuizStore } from '../../store/quiz/quiz.store';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './quiz-result.component.html',
})
export class QuizResultComponent {
  protected readonly store = inject(QuizStore);
}

