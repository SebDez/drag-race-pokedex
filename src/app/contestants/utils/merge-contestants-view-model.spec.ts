import { describe, it, expect } from 'vitest';
import { GroupMode } from '../constants/group-mode';
import type { Contestant } from '../models/contestant';
import type { ContestantSection, ContestantsViewModel } from '../../store/contestants/types';
import {
  countLoadedInViewModel,
  mergeContestantsViewModels,
} from './merge-contestants-view-model';

const section = (key: string, names: string[]): ContestantSection => ({
  key,
  contestants: names.map((dragName) => ({ dragName } as Contestant)),
});

describe('merge-contestants-view-model', () => {
  describe('countLoadedInViewModel', () => {
    it('should count list length in All mode', () => {
      const vm: ContestantsViewModel = {
        mode: GroupMode.All,
        list: [{ dragName: 'A' }, { dragName: 'B' }] as Contestant[],
        sections: null,
      };
      expect(countLoadedInViewModel(vm)).toBe(2);
    });

    it('should sum contestants in sections for grouped modes', () => {
      const vm: ContestantsViewModel = {
        mode: GroupMode.Alphabetical,
        list: null,
        sections: [section('A', ['a1']), section('B', ['b1', 'b2'])],
      };
      expect(countLoadedInViewModel(vm)).toBe(3);
    });
  });

  describe('mergeContestantsViewModels', () => {
    it('should append lists in All mode', () => {
      const prev: ContestantsViewModel = {
        mode: GroupMode.All,
        list: [{ dragName: 'A' }] as Contestant[],
        sections: null,
      };
      const next: ContestantsViewModel = {
        mode: GroupMode.All,
        list: [{ dragName: 'B' }] as Contestant[],
        sections: null,
      };
      const merged = mergeContestantsViewModels(prev, next);
      expect(merged.mode).toBe(GroupMode.All);
      if (merged.mode === GroupMode.All) {
        expect(merged.list.map((c) => c.dragName)).toEqual(['A', 'B']);
      }
    });

    it('should return incoming when modes differ', () => {
      const prev: ContestantsViewModel = {
        mode: GroupMode.All,
        list: [],
        sections: null,
      };
      const next: ContestantsViewModel = {
        mode: GroupMode.Alphabetical,
        list: null,
        sections: [section('A', ['a'])],
      };
      expect(mergeContestantsViewModels(prev, next)).toBe(next);
    });

    it('should merge Alphabetical sections by letter', () => {
      const prev: ContestantsViewModel = {
        mode: GroupMode.Alphabetical,
        list: null,
        sections: [section('A', ['a1'])],
      };
      const next: ContestantsViewModel = {
        mode: GroupMode.Alphabetical,
        list: null,
        sections: [section('A', ['a2']), section('B', ['b1'])],
      };
      const merged = mergeContestantsViewModels(prev, next);
      expect(merged.mode).toBe(GroupMode.Alphabetical);
      if (merged.mode === GroupMode.Alphabetical) {
        const a = merged.sections.find((s) => s.key === 'A');
        expect(a?.contestants.map((c) => c.dragName)).toEqual(['a1', 'a2']);
      }
    });
  });
});
