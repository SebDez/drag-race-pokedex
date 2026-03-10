import { EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

/**
 * Provides a mock TranslateService for unit tests.
 * By default returns the key as value; pass a map for custom translations.
 */
export function provideTranslateMock(translations: Record<string, string> = {}): {
  provide: typeof TranslateService;
  useValue: Partial<TranslateService>;
} {
  const instant = (key: string, params?: Record<string, unknown>): string => {
    let out = translations[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        out = out.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      }
    }
    return out;
  };

  return {
    provide: TranslateService,
    useValue: {
      currentLang: 'en',
      defaultLang: 'en',
      onLangChange: new EventEmitter(),
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
      onFallbackLangChange: new EventEmitter(),
      instant,
      get: (key: string, params?: Record<string, unknown>) => of(instant(key, params)),
      stream: (key: string, params?: Record<string, unknown>) => of(instant(key, params)),
      use: (_lang: string) => of({}),
      addLangs: () => {},
      setDefaultLang: (_lang: string) => of({}),
    },
  };
}
