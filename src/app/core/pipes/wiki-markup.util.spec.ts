import { sanitizeWikiMarkup } from './wiki-markup.util';

describe('sanitizeWikiMarkup', () => {
  it('resolves ht templates to the long form', () => {
    expect(sanitizeWikiMarkup('5th ({{ht|Orig.|Originally}} 6th)')).toBe(
      '5th (Originally 6th)',
    );
    expect(sanitizeWikiMarkup('Runner-Up ({{ht|Orig.|Originally}} 5th)')).toBe(
      'Runner-Up (Originally 5th)',
    );
  });

  it('resolves Transl templates to the English form', () => {
    expect(
      sanitizeWikiMarkup('9th ({{Transl|PT|Miss Simpatia|Miss Congeniality}})'),
    ).toBe('9th (Miss Congeniality)');
    expect(
      sanitizeWikiMarkup('7th (Quit & {{Transl|FR|Miss Sympathie|Miss Congeniality}})'),
    ).toBe('7th (Quit & Miss Congeniality)');
  });

  it('strips Ref citation templates', () => {
    expect(
      sanitizeWikiMarkup(
        '9th (Fan Favorite) {{Ref|lang=IT|title=File:x.mp4|link=https://example.com}}',
      ),
    ).toBe('9th (Fan Favorite)');
  });

  it('strips opaque short wiki codes in parentheses', () => {
    expect(sanitizeWikiMarkup('6th ( MM )')).toBe('6th');
    expect(sanitizeWikiMarkup('Runner-Up ( MMH )')).toBe('Runner-Up');
  });

  it('drops unknown templates and empty parentheses', () => {
    expect(sanitizeWikiMarkup('10th ({{Unknown|x}})').replace(/\s+/g, ' ')).toBe('10th');
  });
});
