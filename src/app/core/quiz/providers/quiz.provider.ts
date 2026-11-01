import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { QuizConfig, QuizQuestion } from '../models/quiz.model';

export abstract class QuizDataProvider {
  abstract generateQuestions(config: QuizConfig): Observable<QuizQuestion[]>;
}

export const QUIZ_DATA_PROVIDER = new InjectionToken<QuizDataProvider>('QUIZ_DATA_PROVIDER');
