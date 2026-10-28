import { PlaceOrdinalPipe } from './place-ordinal.pipe';

describe('PlaceOrdinalPipe', () => {
  const pipe = new PlaceOrdinalPipe();

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
    expect(pipe.transform('1st', 'en')).toBe('1st');
    expect(pipe.transform('2nd', 'en')).toBe('2nd');
    expect(pipe.transform('10th', 'en')).toBe('10th');
  });

  it('should convert to French ordinals when lang is fr', () => {
    expect(pipe.transform('1st', 'fr')).toBe('1er');
    expect(pipe.transform('2nd', 'fr')).toBe('2e');
    expect(pipe.transform('3rd', 'fr')).toBe('3e');
    expect(pipe.transform('10th', 'fr')).toBe('10e');
  });

  it('should convert to Spanish ordinals when lang is es', () => {
    expect(pipe.transform('1st', 'es')).toBe('1.º');
    expect(pipe.transform('2nd', 'es')).toBe('2.º');
    expect(pipe.transform('10th', 'es')).toBe('10.º');
  });

  it('should sanitize wiki markup before converting ordinals', () => {
    expect(pipe.transform('5th ({{ht|Orig.|Originally}} 6th)', 'en')).toBe(
      '5th (Originally 6th)',
    );
    expect(pipe.transform('5th ({{ht|Orig.|Originally}} 6th)', 'fr')).toBe('5e (Originally 6e)');
  });
});
