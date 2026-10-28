import { answersMatch, normalizeAnswer } from './answer-normalize.util';

describe('answer-normalize.util', () => {
  it('normalizes case, accents and punctuation', () => {
    expect(normalizeAnswer("  A'Keria  C.  Davenport ")).toBe('akeria c davenport');
    expect(normalizeAnswer('Drag Race España')).toBe('drag race espana');
  });

  it('matches tolerant cash answers', () => {
    expect(answersMatch('akeria c davenport', ["A'Keria C. Davenport"])).toBe(true);
    expect(answersMatch('wrong', ["A'Keria C. Davenport"])).toBe(false);
    expect(answersMatch('', ['Someone'])).toBe(false);
  });
});
