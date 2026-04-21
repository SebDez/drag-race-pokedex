import { TestBed } from '@angular/core/testing';
import { LangSelectorComponent } from './lang-selector.component';
import { LangService } from '../../core/lang.service';
import { provideTranslateMock } from '../../testing/translate-mock';
import { vi } from 'vitest';

describe('LangSelectorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LangSelectorComponent],
      providers: [LangService, provideTranslateMock()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LangSelectorComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display current language flag', () => {
    const fixture = TestBed.createComponent(LangSelectorComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-flag-displayer')).toBeTruthy();
  });

  it('should have role combobox and aria-expanded', () => {
    const fixture = TestBed.createComponent(LangSelectorComponent);
    fixture.detectChanges();
    const wrapper = (fixture.nativeElement as HTMLElement).querySelector('[role="combobox"]');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.getAttribute('aria-expanded')).toBe('false');
  });

  it('should open listbox on button click', () => {
    const fixture = TestBed.createComponent(LangSelectorComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const btn = host.querySelector('button');
    const combobox = host.querySelector('[role="combobox"]');
    expect(combobox?.getAttribute('aria-expanded')).toBe('false');
    btn?.click();
    fixture.detectChanges();
    expect(combobox?.getAttribute('aria-expanded')).toBe('true');
    const listbox = host.querySelector('[role="listbox"]');
    expect(listbox).toBeTruthy();
  });

  it('should call LangService.setLang when selecting a language', () => {
    const langService = TestBed.inject(LangService);
    const setLangSpy = vi.spyOn(langService, 'setLang');
    const fixture = TestBed.createComponent(LangSelectorComponent);
    fixture.detectChanges();
    const btn = (fixture.nativeElement as HTMLElement).querySelector('button');
    btn?.click();
    fixture.detectChanges();
    const options = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '[role="option"] button',
    );
    (options[0] as HTMLElement).click();
    fixture.detectChanges();
    expect(setLangSpy).toHaveBeenCalledWith('fr');
  });
});
