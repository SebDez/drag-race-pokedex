import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import type { QuizQuestion } from '../models/quiz.model';
import { QUIZ_DATA_PROVIDER } from '../providers/quiz.provider';
import { QuizPrefsService } from '../services/quiz-prefs.service';
import { QuizStore } from './quiz.store';

function question(id: string, correct: string): QuizQuestion {
  return {
    id,
    type: 'whoIsThis',
    imageUrl: `https://example.com/${correct}.jpg`,
    promptKey: 'quiz.questions.whoIsThis',
    promptParams: {},
    correctAnswers: [correct],
    correctAnswerWikis: [],
    duoOptions: [correct, 'Other'],
    squareOptions: [correct, 'Other', 'Third', 'Fourth'],
    cashSuggestions: [correct, 'Other', 'Third', 'Fourth'],
    answerImages: {
      [correct]: `https://example.com/${correct}.jpg`,
      Other: 'https://example.com/Other.jpg',
    },
  };
}

describe('QuizStore feedback flow', () => {
  let store: QuizStore;
  let questions: QuizQuestion[];

  beforeEach(() => {
    questions = [question('q1', 'Alpha'), question('q2', 'Beta')];

    TestBed.configureTestingModule({
      providers: [
        QuizStore,
        {
          provide: QUIZ_DATA_PROVIDER,
          useValue: {
            generateQuestions: () => of(questions),
          },
        },
        {
          provide: QuizPrefsService,
          useValue: {
            load: () => ({ franchises: [] }),
            save: () => undefined,
          },
        },
      ],
    });

    store = TestBed.inject(QuizStore);
  });

  function startAndAnswer(answer: string): void {
    store.startQuick();
    expect(store.phase()).toBe('playing');
    store.selectMode('duo');
    store.submitAnswer(answer);
  }

  it('moves to feedback without advancing the index on submitAnswer', () => {
    startAndAnswer('Alpha');

    expect(store.phase()).toBe('feedback');
    expect(store.currentIndex()).toBe(0);
    expect(store.lastAnswer()?.correct).toBe(true);
    expect(store.lastAnswer()?.points).toBe(2);
    expect(store.score()).toBe(2);
  });

  it('continueAfterFeedback advances to the next question', () => {
    startAndAnswer('Other');

    expect(store.phase()).toBe('feedback');
    expect(store.lastAnswer()?.correct).toBe(false);

    store.continueAfterFeedback();

    expect(store.phase()).toBe('playing');
    expect(store.currentIndex()).toBe(1);
    expect(store.selectedMode()).toBeNull();
    expect(store.currentQuestion()?.id).toBe('q2');
  });

  it('shows feedback on the last question then goes to recap', () => {
    startAndAnswer('Alpha');
    store.continueAfterFeedback();

    store.selectMode('cash');
    store.submitAnswer('Beta');

    expect(store.phase()).toBe('feedback');
    expect(store.currentIndex()).toBe(1);
    expect(store.lastAnswer()?.correct).toBe(true);
    expect(store.lastAnswer()?.points).toBe(10);

    store.continueAfterFeedback();

    expect(store.phase()).toBe('recap');
    expect(store.correctCount()).toBe(2);
    expect(store.score()).toBe(12);
  });

  it('ignores continueAfterFeedback outside feedback phase', () => {
    store.startQuick();
    store.continueAfterFeedback();
    expect(store.phase()).toBe('playing');
    expect(store.currentIndex()).toBe(0);
  });
});
