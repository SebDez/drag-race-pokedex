import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContestantsService } from '@app/core/contestants/services/contestant.service';
import {
  APP_VERSION,
  DATASET_REPO_URL,
  FEEDBACK_FORM_URL,
} from './app-info.constants';

@Injectable({ providedIn: 'root' })
export class AppInfoService {
  private readonly contestants = inject(ContestantsService);

  readonly appVersion = APP_VERSION;
  readonly feedbackFormUrl = FEEDBACK_FORM_URL;
  readonly datasetRepoUrl = DATASET_REPO_URL;

  /** True when the feedback URL still needs to be configured. */
  readonly feedbackConfigured = !FEEDBACK_FORM_URL.includes('REPLACE_ME');

  readonly extractMeta = toSignal(this.contestants.getExtractMeta(), {
    initialValue: null,
  });
}
