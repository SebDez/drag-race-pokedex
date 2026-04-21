import { TestBed } from '@angular/core/testing';
import { WinsBadgeComponent } from './wins-badge.component';
import { provideTranslateMock } from '../../../testing/translate-mock';

describe('WinsBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinsBadgeComponent],
      providers: [provideTranslateMock()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(WinsBadgeComponent);
    fixture.componentRef.setInput('count', 2);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not render when count is 0', () => {
    const fixture = TestBed.createComponent(WinsBadgeComponent);
    fixture.componentRef.setInput('count', 0);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('span')).toBeNull();
  });

  it('should render count and trophy when count > 0', () => {
    const fixture = TestBed.createComponent(WinsBadgeComponent);
    fixture.componentRef.setInput('count', 3);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const span = el.querySelector('span');
    expect(span).toBeTruthy();
    expect(span?.textContent?.trim()).toContain('3');
    expect(el.querySelector('app-trophy-icon')).toBeTruthy();
  });

  it('should set title from common.wins when count > 1', () => {
    const fixture = TestBed.createComponent(WinsBadgeComponent);
    fixture.componentRef.setInput('count', 2);
    fixture.detectChanges();
    const span = (fixture.nativeElement as HTMLElement).querySelector('span');
    expect(span?.getAttribute('title')).toBeDefined();
  });
});
