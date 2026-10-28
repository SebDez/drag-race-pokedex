import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ContestantsService } from '@app/core/contestants/services/contestant.service';
import { QuizDataProvider } from './quiz.provider';
import type { QuizConfig, QuizQuestion } from '../models/quiz.model';
import { generateQuizQuestions } from '../utils/quiz-question-generator.util';

@Injectable({ providedIn: 'root' })
export class LocalQuizDataProvider extends QuizDataProvider {
  constructor(private readonly contestants: ContestantsService) {
    super();
  }

  override generateQuestions(config: QuizConfig): Observable<QuizQuestion[]> {
    return this.contestants
      .getAllContestants()
      .pipe(map((all) => generateQuizQuestions(all, config)));
  }
}
