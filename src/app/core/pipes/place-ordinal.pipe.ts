import { Pipe, PipeTransform } from '@angular/core';
import { sanitizeWikiMarkup } from './wiki-markup.util';

@Pipe({ name: 'placeOrdinal', standalone: true, pure: true })
export class PlaceOrdinalPipe implements PipeTransform {
  transform(rawPlace: string | null | undefined, lang = 'en'): string {
    const trimmed = rawPlace?.trim() ?? '';
    if (!trimmed) return trimmed;

    const value = sanitizeWikiMarkup(trimmed);
    if (!value) return value;

    const code = lang.slice(0, 2).toLowerCase();

    if (code === 'fr') {
      return value
        .replace(/(\d+)st\b/g, (_, n) => (n === '1' ? '1er' : `${n}e`))
        .replace(/(\d+)nd\b/g, (_, n) => `${n}e`)
        .replace(/(\d+)rd\b/g, (_, n) => `${n}e`)
        .replace(/(\d+)th\b/g, (_, n) => `${n}e`);
    }

    if (code === 'es') {
      return value
        .replace(/(\d+)st\b/g, (_, n) => `${n}.º`)
        .replace(/(\d+)nd\b/g, (_, n) => `${n}.º`)
        .replace(/(\d+)rd\b/g, (_, n) => `${n}.º`)
        .replace(/(\d+)th\b/g, (_, n) => `${n}.º`);
    }

    return value;
  }
}
