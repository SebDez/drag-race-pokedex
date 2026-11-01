import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { provideTranslateMock } from './testing/translate-mock';
import { LangService } from './core/lang.service';
import { CONTESTANTS_DATA_PROVIDER } from './core/contestants/providers/contestants.provider';
import { LocalJsonContestantsProvider } from './core/contestants/providers/local-json-contestants.provider';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        LangService,
        provideTranslateMock(),
        { provide: CONTESTANTS_DATA_PROVIDER, useClass: LocalJsonContestantsProvider },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router-outlet, nav, footer and lang selector', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-lang-selector')).toBeTruthy();
    expect(compiled.querySelector('nav.app-nav')).toBeTruthy();
    expect(compiled.querySelector('main.app-main')).toBeTruthy();
    expect(compiled.querySelector('footer.app-footer')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
