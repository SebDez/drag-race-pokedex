import { Component, OnDestroy, inject } from '@angular/core';
import { QuizHeaderComponent } from './quiz-header.component';
import { QuizRulesComponent } from './quiz-rules.component';
import { QuizPlayComponent } from './quiz-play.component';
import { QuizResultComponent } from './quiz-result.component';
import { QuizCtaComponent } from './quiz-cta.component';
import { QuizStore } from '../../store/quiz/quiz.store';
import { QuizStatus } from '../../store/quiz/quiz.types';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    QuizHeaderComponent,
    QuizRulesComponent,
    QuizPlayComponent,
    QuizResultComponent,
    QuizCtaComponent,
  ],
  templateUrl: './quiz.component.html',
})
export class QuizComponent implements OnDestroy {
  protected readonly store = inject(QuizStore);

  protected isIdle(): boolean {
    return this.store.status() === QuizStatus.Idle;
  }

  protected isInProgress(): boolean {
    return this.store.status() === QuizStatus.InProgress;
  }

  protected isFinished(): boolean {
    return this.store.status() === QuizStatus.Finished;
  }

  ngOnDestroy(): void {
    this.store.reset();
  }
}
