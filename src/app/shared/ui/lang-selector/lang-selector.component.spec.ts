import { TestBed } from '@angular/core/testing';
import { LangSelectorComponent } from './lang-selector.component';
import { LangService } from '@app/core/lang.service';
import { provideTranslateMock } from '@app/testing/translate-mock';
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

  it('should display current language code on the trigger', () => {
    const fixture = TestBed.createComponent(LangSelectorComponent);
    fixture.detectChanges();
    const btn = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(btn?.textContent?.trim().toLowerCase()).toBe('en');
  });

  it('should expose aria-expanded on the trigger button', () => {
    const fixture = TestBed.createComponent(LangSelectorComponent);
    fixture.detectChanges();
    const btn = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(btn?.getAttribute('aria-expanded')).toBe('false');
    expect(btn?.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('should open menu on button click', () => {
    const fixture = TestBed.createComponent(LangSelectorComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const btn = host.querySelector('button');
    expect(btn?.getAttribute('aria-expanded')).toBe('false');
    btn?.click();
    fixture.detectChanges();
    expect(btn?.getAttribute('aria-expanded')).toBe('true');
    expect(host.querySelector('[role="menu"]')).toBeTruthy();
  });

  it('should call LangService.setLang when selecting a language', () => {
    const langService = TestBed.inject(LangService);
    const setLangSpy = vi.spyOn(langService, 'setLang');
    const fixture = TestBed.createComponent(LangSelectorComponent);
    fixture.detectChanges();
    const btn = (fixture.nativeElement as HTMLElement).querySelector('button');
    btn?.click();
    fixture.detectChanges();
    const options = (fixture.nativeElement as HTMLElement).querySelectorAll('[role="menuitem"]');
    (options[0] as HTMLElement).click();
    fixture.detectChanges();
    expect(setLangSpy).toHaveBeenCalledWith('fr');
  });
});
