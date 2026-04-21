import { TestBed } from '@angular/core/testing';
import { FranchiseBadgeComponent } from './franchise-badge.component';

describe('FranchiseBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FranchiseBadgeComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(FranchiseBadgeComponent);
    fixture.componentRef.setInput('franchiseName', "RuPaul's Drag Race");
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not render when franchiseName is empty', () => {
    const fixture = TestBed.createComponent(FranchiseBadgeComponent);
    fixture.componentRef.setInput('franchiseName', '');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('span')).toBeNull();
  });

  it('should render flag for known franchise (US)', () => {
    const fixture = TestBed.createComponent(FranchiseBadgeComponent);
    fixture.componentRef.setInput('franchiseName', "RuPaul's Drag Race");
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-flag-displayer')).toBeTruthy();
  });

  it('should use country input when provided', () => {
    const fixture = TestBed.createComponent(FranchiseBadgeComponent);
    fixture.componentRef.setInput('franchiseName', 'Some Show');
    fixture.componentRef.setInput('country', 'France');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const flag = el.querySelector('app-flag-displayer');
    expect(flag).toBeTruthy();
  });

  it('should apply truncate classes when truncate is true', () => {
    const fixture = TestBed.createComponent(FranchiseBadgeComponent);
    fixture.componentRef.setInput('franchiseName', "RuPaul's Drag Race");
    fixture.componentRef.setInput('truncate', true);
    fixture.detectChanges();
    const span = (fixture.nativeElement as HTMLElement).querySelector('span');
    expect(span?.classList.contains('truncate')).toBe(true);
  });
});
