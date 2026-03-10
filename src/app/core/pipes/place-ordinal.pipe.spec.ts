import { TestBed } from '@angular/core/testing';
import { PlaceOrdinalPipe } from './place-ordinal.pipe';
import { TranslateService } from '@ngx-translate/core';
import { provideTranslateMock } from '../../testing/translate-mock';

describe('PlaceOrdinalPipe', () => {
  let pipe: PlaceOrdinalPipe;
  let translate: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlaceOrdinalPipe, provideTranslateMock()],
    });
    pipe = TestBed.inject(PlaceOrdinalPipe);
    translate = TestBed.inject(TranslateService);
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null/undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return trimmed value for empty string', () => {
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform('   ')).toBe('');
  });

  it('should leave English ordinals unchanged when lang is en', () => {
    (translate as { currentLang: string }).currentLang = 'en';
    expect(pipe.transform('1st')).toBe('1st');
    expect(pipe.transform('2nd')).toBe('2nd');
    expect(pipe.transform('10th')).toBe('10th');
  });

  it('should convert to French ordinals when lang is fr', () => {
    (translate as { currentLang: string }).currentLang = 'fr';
    expect(pipe.transform('1st')).toBe('1er');
    expect(pipe.transform('2nd')).toBe('2e');
    expect(pipe.transform('3rd')).toBe('3e');
    expect(pipe.transform('10th')).toBe('10e');
  });

  it('should convert to Spanish ordinals when lang is es', () => {
    (translate as { currentLang: string }).currentLang = 'es';
    expect(pipe.transform('1st')).toBe('1.º');
    expect(pipe.transform('2nd')).toBe('2.º');
    expect(pipe.transform('10th')).toBe('10.º');
  });
});
