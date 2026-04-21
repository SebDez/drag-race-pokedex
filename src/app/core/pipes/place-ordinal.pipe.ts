import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'placeOrdinal', standalone: true, pure: false })
export class PlaceOrdinalPipe implements PipeTransform {
  constructor(private readonly translate: TranslateService) {}

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
