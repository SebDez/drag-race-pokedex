import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ContestantImageComponent } from './contestant-image.component';

describe('ContestantImageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestantImageComponent],
    }).compileComponents();
  });

  function createFixture(overrides: {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
    priority?: boolean;
    objectFit?: 'cover' | 'contain';
    wrapperClass?: string;
  } = {}) {
    const fixture = TestBed.createComponent(ContestantImageComponent);
    fixture.componentRef.setInput('width', overrides.width ?? 64);
    fixture.componentRef.setInput('height', overrides.height ?? 64);
    fixture.componentRef.setInput('src', overrides.src ?? '');
    fixture.componentRef.setInput('alt', overrides.alt ?? '');
    if (overrides.priority !== undefined) {
      fixture.componentRef.setInput('priority', overrides.priority);
    }
    if (overrides.objectFit !== undefined) {
      fixture.componentRef.setInput('objectFit', overrides.objectFit);
    }
    if (overrides.wrapperClass !== undefined) {
      fixture.componentRef.setInput('wrapperClass', overrides.wrapperClass);
    }
    fixture.detectChanges();
    return fixture;
  }

  it('should create', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render gradient placeholder when src is empty', () => {
    const fixture = createFixture({ src: '' });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('img')).toBeFalsy();
    const placeholder = el.querySelector('span.block.w-full.h-full');
    expect(placeholder).toBeTruthy();
  });

  it('should render img when src is set', () => {
    const fixture = createFixture({ src: 'https://example.com/queen.jpg' });
    const el = fixture.nativeElement as HTMLElement;
    const img = el.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('https://example.com/queen.jpg');
    expect(img?.getAttribute('width')).toBe('64');
    expect(img?.getAttribute('height')).toBe('64');
  });

  it('should use lazy loading and low fetch priority by default', () => {
    const fixture = createFixture({ src: 'https://example.com/a.jpg' });
    const img = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(img?.getAttribute('loading')).toBe('lazy');
    expect(img?.getAttribute('fetchpriority')).toBe('low');
  });

  it('should use eager loading and high fetch priority when priority is true', () => {
    const fixture = createFixture({ src: 'https://example.com/a.jpg', priority: true });
    const img = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(img?.getAttribute('loading')).toBe('eager');
    expect(img?.getAttribute('fetchpriority')).toBe('high');
  });

  it('should apply object-contain when objectFit is contain', () => {
    const fixture = createFixture({
      src: 'https://example.com/a.jpg',
      objectFit: 'contain',
    });
    const img = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(img?.classList.contains('object-contain')).toBe(true);
  });

  it('should apply object-cover when objectFit is cover', () => {
    const fixture = createFixture({
      src: 'https://example.com/a.jpg',
      objectFit: 'cover',
    });
    const img = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(img?.classList.contains('object-cover')).toBe(true);
  });

  it('should set alt on img', () => {
    const fixture = createFixture({
      src: 'https://example.com/a.jpg',
      alt: 'Test Queen',
    });
    const img = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(img?.getAttribute('alt')).toBe('Test Queen');
  });

  it('should add opacity-100 to img after load event', () => {
    const fixture = createFixture({ src: 'https://example.com/a.jpg' });
    const el = fixture.nativeElement as HTMLElement;
    const img = el.querySelector('img') as HTMLImageElement;
    expect(img.classList.contains('opacity-0')).toBe(true);
    img.dispatchEvent(new Event('load'));
    fixture.detectChanges();
    expect(img.classList.contains('opacity-100')).toBe(true);
  });

  it('should remove img and show fallback after error event', () => {
    const fixture = createFixture({ src: 'https://example.com/missing.jpg' });
    const el = fixture.nativeElement as HTMLElement;
    const img = el.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(el.querySelector('img')).toBeFalsy();
    const fallback = el.querySelector('span.absolute.inset-0.z-10');
    expect(fallback).toBeTruthy();
  });

  it('should merge wrapperClass on root element', () => {
    const fixture = createFixture({
      src: '',
      wrapperClass: 'rounded-lg extra',
    });
    const root = (fixture.nativeElement as HTMLElement).querySelector(
      '.relative.w-full.h-full',
    ) as HTMLElement;
    expect(root.classList.contains('rounded-lg')).toBe(true);
    expect(root.classList.contains('extra')).toBe(true);
  });
});
