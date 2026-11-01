import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import type { QuizAnswerRecord, QuizQuestion } from '@app/core/quiz/models/quiz.model';
import { QuizStore } from '@app/core/quiz/store/quiz.store';
import { provideTranslateMock } from '@app/testing/translate-mock';
import { QuizFeedbackComponent } from './quiz-feedback.component';

function makeQuestion(): QuizQuestion {
  return {
    id: 'q1',
    type: 'whoIsThis',
    imageUrl: 'https://example.com/Alpha.jpg',
    promptKey: 'quiz.questions.whoIsThis',
    promptParams: {},
    correctAnswers: ['Alpha'],
    correctAnswerWikis: [],
    duoOptions: ['Alpha', 'Beta'],
    squareOptions: ['Alpha', 'Beta', 'Gamma', 'Delta'],
    cashSuggestions: ['Alpha', 'Beta'],
    answerImages: {
      Alpha: 'https://example.com/Alpha.jpg',
      Beta: 'https://example.com/Beta.jpg',
    },
  };
}

function makeAnswer(correct: boolean): QuizAnswerRecord {
  return {
    questionId: 'q1',
    mode: 'duo',
    userAnswer: correct ? 'Alpha' : 'Beta',
    correct,
    points: correct ? 2 : 0,
    maxPoints: 2,
  };
}

describe('QuizFeedbackComponent', () => {
  const phase = signal<'feedback'>('feedback');
  const lastAnswer = signal<QuizAnswerRecord | null>(null);
  const currentQuestion = signal<QuizQuestion | null>(makeQuestion());
  const score = signal(2);
  const maxScore = signal(100);
  const continueSpy = vi.fn();

  beforeEach(async () => {
    continueSpy.mockClear();
    lastAnswer.set(makeAnswer(true));
    currentQuestion.set(makeQuestion());
    score.set(2);

    const base = provideTranslateMock({
      'quiz.feedback.yourAnswer': 'You answered',
      'quiz.feedback.correctAnswer': 'The answer was',
      'quiz.feedback.continue': 'Continue',
      'quiz.feedback.pointsGained': '+{{points}} pts',
      'quiz.feedback.timerLabel': 'Timer',
      'quiz.recap.emptyAnswer': '(empty)',
      'quiz.recap.vibeHigh': 'Condragulations!',
      'quiz.recap.vibeLow': 'Sashay away...',
    });

    await TestBed.configureTestingModule({
      imports: [QuizFeedbackComponent],
      providers: [
        {
          provide: TranslateService,
          useValue: {
            ...base.useValue,
            instant: (key: string, params?: Record<string, unknown>) => {
              if (key === 'quiz.feedback.successTitles') {
                return ['Condragulations!', 'Shantay, you stay!'];
              }
              if (key === 'quiz.feedback.failTitles') {
                return ['Sashay away…', 'Not today, Satan…'];
              }
              return (base.useValue.instant as (k: string, p?: Record<string, unknown>) => string)(
                key,
                params,
              );
            },
            get: (key: string, params?: Record<string, unknown>) =>
              of(
                (base.useValue.instant as (k: string, p?: Record<string, unknown>) => string)(
                  key,
                  params,
                ),
              ),
            stream: (key: string, params?: Record<string, unknown>) =>
              of(
                (base.useValue.instant as (k: string, p?: Record<string, unknown>) => string)(
                  key,
                  params,
                ),
              ),
          },
        },
        {
          provide: QuizStore,
          useValue: {
            phase: phase.asReadonly(),
            lastAnswer: lastAnswer.asReadonly(),
            currentQuestion: currentQuestion.asReadonly(),
            score: score.asReadonly(),
            maxScore: maxScore.asReadonly(),
            continueAfterFeedback: continueSpy,
          },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders success feedback with gained points', () => {
    lastAnswer.set(makeAnswer(true));
    const fixture = TestBed.createComponent(QuizFeedbackComponent);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.quiz-feedback--ok')).toBeTruthy();
    expect(root.textContent).toContain('+2 pts');
    expect(root.textContent).toContain('2');
    expect(root.querySelector('.quiz-feedback__compare')).toBeNull();
  });

  it('renders wrong feedback with comparison blocks', () => {
    lastAnswer.set(makeAnswer(false));
    score.set(0);
    const fixture = TestBed.createComponent(QuizFeedbackComponent);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.quiz-feedback--ko')).toBeTruthy();
    expect(root.querySelector('.quiz-feedback__compare')).toBeTruthy();
    expect(root.textContent).toContain('Beta');
    expect(root.textContent).toContain('Alpha');
    expect(root.textContent).toContain('You answered');
    expect(root.textContent).toContain('The answer was');
  });

  it('calls continueAfterFeedback when Continue is clicked', () => {
    lastAnswer.set(makeAnswer(true));
    const fixture = TestBed.createComponent(QuizFeedbackComponent);
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button.quiz-feedback__continue',
    ) as HTMLButtonElement;
    button.click();

    expect(continueSpy).toHaveBeenCalledTimes(1);
  });
});
