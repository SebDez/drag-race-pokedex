import { ChangeDetectionStrategy, Component } from '@angular/core';
import { QuizStore } from '@app/core/quiz/store/quiz.store';
import { QuizSetupComponent } from './components/quiz-setup/quiz-setup.component';
import { QuizPlayComponent } from './components/quiz-play/quiz-play.component';
import { QuizRecapComponent } from './components/quiz-recap/quiz-recap.component';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [QuizSetupComponent, QuizPlayComponent, QuizRecapComponent],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizComponent {
  constructor(protected readonly store: QuizStore) {}
}
