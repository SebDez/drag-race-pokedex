import type { Contestant } from '@app/core/contestants/models/contestant.model';
import { generateQuizQuestions } from './quiz-question-generator.util';

function queen(
  name: string,
  franchise: string,
  opts?: { winner?: boolean; season?: string },
): Contestant {
  return {
    dragName: name,
    imageUrl: `https://example.com/${name}.jpg`,
    wikiUrl: '',
    seasons: [
      {
        franchise,
        season: opts?.season ?? '1',
        rawPlace: opts?.winner ? '1st' : '5th',
        places: [opts?.winner ? 1 : 5],
        mainPlace: opts?.winner ? 1 : 5,
        isWinner: !!opts?.winner,
        challengeWins: 1,
      },
    ],
    firstFranchise: franchise,
    miniPromoImageUrl: `https://example.com/${name}-mini.jpg`,
    totalChallengeWins: 1,
    isWinner: !!opts?.winner,
    firstFranchiseCountry: 'United States',
  };
}

describe('generateQuizQuestions', () => {
  const pool: Contestant[] = [
    queen('Alpha', "RuPaul's Drag Race", { winner: true, season: '1' }),
    queen('Beta', "RuPaul's Drag Race"),
    queen('Gamma', "RuPaul's Drag Race UK", { winner: true, season: '1' }),
    queen('Delta', "RuPaul's Drag Race UK"),
    queen('Epsilon', "Canada's Drag Race", { winner: true, season: '1' }),
    queen('Zeta', "Canada's Drag Race"),
  ];

  it('generates the requested number of questions', () => {
    const questions = generateQuizQuestions(pool, {
      questionCount: 10,
      franchises: [],
    });
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.length).toBeLessThanOrEqual(10);
    for (const q of questions) {
      expect(q.duoOptions.length).toBe(2);
      expect(q.correctAnswers.length).toBeGreaterThan(0);
      expect(q.duoOptions).toContain(q.correctAnswers[0]);
      expect(q.cashSuggestions.length).toBeGreaterThan(0);
    }
  });

  it('returns empty when pool is too small', () => {
    expect(
      generateQuizQuestions([pool[0]], { questionCount: 10, franchises: [] }),
    ).toEqual([]);
  });

  it('keeps duo/square/cash proposals inside the selected franchises', () => {
    const allowedFranchise = "RuPaul's Drag Race";
    const allowedNames = new Set(['Alpha', 'Beta']);
    const questions = generateQuizQuestions(pool, {
      questionCount: 10,
      franchises: [allowedFranchise],
    });

    expect(questions.length).toBeGreaterThan(0);

    for (const q of questions) {
      if (q.type === 'firstFranchise') {
        for (const option of [...q.duoOptions, ...q.squareOptions, ...q.cashSuggestions]) {
          expect(option).toBe(allowedFranchise);
        }
        continue;
      }

      for (const option of [...q.duoOptions, ...q.squareOptions, ...q.cashSuggestions]) {
        expect(allowedNames.has(option)).toBe(true);
      }
      for (const answer of q.correctAnswers) {
        expect(allowedNames.has(answer)).toBe(true);
      }
      if (q.type === 'seasonWinner') {
        expect(q.promptParams['franchise']).toBe(allowedFranchise);
      }
    }
  });

  it('keeps season-winner proposals inside that franchise only', () => {
    const enriched: Contestant[] = [
      ...pool,
      queen('Eta', "RuPaul's Drag Race"),
      queen('Theta', "RuPaul's Drag Race"),
      queen('Iota', "RuPaul's Drag Race UK"),
      queen('Kappa', "RuPaul's Drag Race UK"),
    ];

    const questions = generateQuizQuestions(enriched, {
      questionCount: 10,
      franchises: [],
    }).filter((q) => q.type === 'seasonWinner');

    expect(questions.length).toBeGreaterThan(0);

    const namesByFranchise: Record<string, Set<string>> = {
      "RuPaul's Drag Race": new Set(['Alpha', 'Beta', 'Eta', 'Theta']),
      "RuPaul's Drag Race UK": new Set(['Gamma', 'Delta', 'Iota', 'Kappa']),
      "Canada's Drag Race": new Set(['Epsilon', 'Zeta']),
    };

    for (const q of questions) {
      const franchise = q.promptParams['franchise'];
      const allowed = namesByFranchise[franchise];
      expect(allowed).toBeTruthy();
      for (const option of [...q.duoOptions, ...q.squareOptions, ...q.cashSuggestions]) {
        expect(allowed.has(option)).toBe(true);
      }
    }
  });
});
