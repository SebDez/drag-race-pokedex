import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const SUPPORTED_LANGS = ['fr', 'en', 'es'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

const STORAGE_KEY = 'drag-race-pokedex-lang';

@Injectable({ providedIn: 'root' })
export class LangService {
  private readonly translate = inject(TranslateService);

  /** Langues supportées (emoji drapeau + code en fallback pour navigateurs sans support emoji). */
  readonly supported: { code: SupportedLang; label: string }[] = [
    { code: 'fr', label: '🇫🇷 FR' },
    { code: 'en', label: '🇬🇧 EN' },
    { code: 'es', label: '🇪🇸 ES' },
  ];

  /** Initialise la langue au démarrage : localStorage > navigateur > défaut. */
  initLang(): void {
    this.translate.addLangs([...SUPPORTED_LANGS]);
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLang | null;
    if (stored && SUPPORTED_LANGS.includes(stored)) {
      this.translate.use(stored);
      return;
    }
    const browser = this.getBrowserLang();
    this.translate.use(browser);
  }

  get currentLang(): SupportedLang {
    const current = this.translate.currentLang;
    const base = current?.slice(0, 2);
    return SUPPORTED_LANGS.includes(base as SupportedLang) ? (base as SupportedLang) : 'en';
  }

  setLang(lang: SupportedLang): void {
    this.translate.use(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  private getBrowserLang(): SupportedLang {
    const raw = typeof navigator !== 'undefined' ? navigator.language : '';
    const code = raw?.slice(0, 2).toLowerCase();
    return SUPPORTED_LANGS.includes(code as SupportedLang) ? (code as SupportedLang) : 'en';
  }
}
