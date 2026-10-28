import { Injectable, Inject, DOCUMENT } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const SUPPORTED_LANGS = ['fr', 'en', 'es'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

const STORAGE_KEY = 'drag-race-pokedex-lang';
const DOCUMENT_TITLE = 'Drag Race Pokédex';

@Injectable({ providedIn: 'root' })
export class LangService {
  readonly supported: { code: SupportedLang; label: string }[] = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
  ];

  constructor(
    private readonly translate: TranslateService,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {}

  initLang(): void {
    this.translate.addLangs([...SUPPORTED_LANGS]);
    this.translate.onLangChange.subscribe((event) => {
      this.applyDocumentMeta(this.normalizeLang(event.lang));
    });

    const stored =
      typeof localStorage !== 'undefined'
        ? (localStorage.getItem(STORAGE_KEY) as SupportedLang | null)
        : null;
    if (stored && SUPPORTED_LANGS.includes(stored)) {
      this.translate.use(stored);
      this.applyDocumentMeta(stored);
      return;
    }
    const browser = this.getBrowserLang();
    this.translate.use(browser);
    this.applyDocumentMeta(browser);
  }

  get currentLang(): SupportedLang {
    return this.normalizeLang(this.translate.currentLang);
  }

  setLang(lang: SupportedLang): void {
    this.translate.use(lang);
    this.applyDocumentMeta(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }

  private applyDocumentMeta(lang: SupportedLang): void {
    this.document.documentElement.lang = lang;
    this.document.title = DOCUMENT_TITLE;
  }

  private normalizeLang(raw: string | null | undefined): SupportedLang {
    const base = raw?.slice(0, 2).toLowerCase();
    return SUPPORTED_LANGS.includes(base as SupportedLang) ? (base as SupportedLang) : 'en';
  }

  private getBrowserLang(): SupportedLang {
    const raw = typeof navigator !== 'undefined' ? navigator.language : '';
    return this.normalizeLang(raw);
  }
}
