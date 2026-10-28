import { Injectable } from '@angular/core';
import { FRANCHISE_NAMES } from '@app/core/contestants/constants/franchises.constants';
import type { QuizPrefs } from '../models/quiz.model';

const STORAGE_KEY = 'drag-race-pokedex-quiz-prefs';

const DEFAULT_PREFS: QuizPrefs = {
  franchises: [],
};

@Injectable({ providedIn: 'root' })
export class QuizPrefsService {
  load(): QuizPrefs {
    if (typeof localStorage === 'undefined') {
      return { ...DEFAULT_PREFS };
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { ...DEFAULT_PREFS };
      }
      const parsed = JSON.parse(raw) as Partial<QuizPrefs>;
      return {
        franchises: this.normalizeFranchises(parsed.franchises),
      };
    } catch {
      return { ...DEFAULT_PREFS };
    }
  }

  save(prefs: QuizPrefs): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    const payload: QuizPrefs = {
      franchises: this.normalizeFranchises(prefs.franchises),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  private normalizeFranchises(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    const allowed = new Set(FRANCHISE_NAMES);
    return uniquePreserveOrder(
      value.filter((f): f is string => typeof f === 'string' && allowed.has(f)),
    );
  }
}

function uniquePreserveOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const v of values) {
    if (!seen.has(v)) {
      seen.add(v);
      result.push(v);
    }
  }
  return result;
}
