import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { CONTESTANTS_DATA_PROVIDER } from './contestants/contestants-data-provider';
import { LocalJsonContestantsProvider } from './contestants/local-json-contestants.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideTranslateService({ defaultLanguage: 'en' }),
    provideTranslateHttpLoader({ prefix: '/assets/i18n/', suffix: '.json' }),
    {
      provide: CONTESTANTS_DATA_PROVIDER,
      useClass: LocalJsonContestantsProvider,
    },
  ],
};
