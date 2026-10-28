/**
 * Strips / resolves common Fandom/MediaWiki leftovers in scraped place strings.
 */
export function sanitizeWikiMarkup(raw: string): string {
  let value = raw;

  // Citations: drop entirely
  value = value.replace(/\{\{\s*Ref\s*\|[^{}]*\}\}/gi, '');

  // {{ht|short|long}} → prefer long form
  value = value.replace(/\{\{\s*ht\s*\|([^{}|]*)\|([^{}|]*)\}\}/gi, (_, _short, long) =>
    String(long).trim(),
  );

  // {{Transl|LANG|native|english}} → english (last readable), else native
  value = value.replace(
    /\{\{\s*Transl\s*\|([^{}|]*)\|([^{}|]*)\|([^{}|]*)\}\}/gi,
    (_, _lang, native, english) => {
      const en = String(english).trim();
      const nat = String(native).trim();
      return en || nat;
    },
  );

  // Any remaining templates → drop
  value = value.replace(/\{\{[^{}]*\}\}/g, '');

  // Opaque short wiki codes (e.g. MM, MMH) are not meaningful in the UI
  value = value.replace(/\(\s*[A-Za-z]{1,4}\s*\)/g, '');

  // Normalize whitespace and empty parentheses
  value = value
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,;])/g, '$1')
    .trim();

  return value;
}
