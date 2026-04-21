import { TestBed } from '@angular/core/testing';
import { FlagDisplayerComponent } from './flag-displayer.component';

describe('FlagDisplayerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlagDisplayerComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(FlagDisplayerComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not render when countryCode is null', () => {
    const fixture = TestBed.createComponent(FlagDisplayerComponent);
    fixture.componentRef.setInput('countryCode', null);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('span')).toBeNull();
  });

  it('should render US flag for countryCode US', () => {
    const fixture = TestBed.createComponent(FlagDisplayerComponent);
    fixture.componentRef.setInput('countryCode', 'US');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-usa-flag-icon')).toBeTruthy();
  });

  it('should render FR flag for countryCode FR', () => {
    const fixture = TestBed.createComponent(FlagDisplayerComponent);
    fixture.componentRef.setInput('countryCode', 'FR');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-france-flag-icon')).toBeTruthy();
  });

  it('should set role="img" and aria-label from title', () => {
    const fixture = TestBed.createComponent(FlagDisplayerComponent);
    fixture.componentRef.setInput('countryCode', 'US');
    fixture.componentRef.setInput('title', 'United States');
    fixture.detectChanges();
    const span = (fixture.nativeElement as HTMLElement).querySelector('span');
    expect(span?.getAttribute('role')).toBe('img');
    expect(span?.getAttribute('aria-label')).toBe('United States');
  });
});
