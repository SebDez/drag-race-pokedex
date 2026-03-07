import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Convierte los ordinales en inglés (1st, 2nd, 10th…) al formato de la lengua actual :
 * francés (1er, 2e, 10e), español (1.º, 2.º, 10.º), inglés inchangé.
 */
@Pipe({ name: 'placeOrdinal', standalone: true, pure: false })
export class PlaceOrdinalPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(rawPlace: string | null | undefined): string {
    const value = rawPlace?.trim() ?? '';
    if (!value) return value;

    const lang = (this.translate.currentLang ?? '').slice(0, 2).toLowerCase();

    if (lang === 'fr') {
      return value
        .replace(/(\d+)st\b/g, (_, n) => (n === '1' ? '1er' : `${n}e`))
        .replace(/(\d+)nd\b/g, (_, n) => `${n}e`)
        .replace(/(\d+)rd\b/g, (_, n) => `${n}e`)
        .replace(/(\d+)th\b/g, (_, n) => `${n}e`);
    }

    if (lang === 'es') {
      return value
        .replace(/(\d+)st\b/g, (_, n) => `${n}.º`)
        .replace(/(\d+)nd\b/g, (_, n) => `${n}.º`)
        .replace(/(\d+)rd\b/g, (_, n) => `${n}.º`)
        .replace(/(\d+)th\b/g, (_, n) => `${n}.º`);
    }

    return value;
  }
}
