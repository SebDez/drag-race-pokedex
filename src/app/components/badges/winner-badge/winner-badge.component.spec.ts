import { TestBed } from '@angular/core/testing';
import { WinnerBadgeComponent } from './winner-badge.component';
import { provideTranslateMock } from '../../../testing/translate-mock';

describe('WinnerBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinnerBadgeComponent],
      providers: [provideTranslateMock()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(WinnerBadgeComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render crown when show is true', () => {
    const fixture = TestBed.createComponent(WinnerBadgeComponent);
    fixture.componentRef.setInput('show', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('span')).toBeTruthy();
    expect(el.querySelector('app-crown-icon')).toBeTruthy();
  });

  it('should not render when show is false', () => {
    const fixture = TestBed.createComponent(WinnerBadgeComponent);
    fixture.componentRef.setInput('show', false);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('span')).toBeNull();
  });

  it('should default show to true', () => {
    const fixture = TestBed.createComponent(WinnerBadgeComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('span')).toBeTruthy();
  });
});
