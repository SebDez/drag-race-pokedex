import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LangService, type SupportedLang } from '../../core/lang.service';
import { Subscription } from 'rxjs';
import { FlagDisplayerComponent } from '../flag-displayer/flag-displayer.component';

/** Map language code to ISO 3166-1 alpha-2 country code for the flag. */
const LANG_TO_COUNTRY: Record<SupportedLang, string> = {
  en: 'US',
  fr: 'FR',
  es: 'ES',
};

@Component({
  selector: 'app-lang-selector',
  standalone: true,
  imports: [TranslateModule, UpperCasePipe, FlagDisplayerComponent],
  templateUrl: './lang-selector.component.html',
})
export class LangSelectorComponent implements OnInit, OnDestroy {
  protected readonly langService = inject(LangService);
  private readonly translate = inject(TranslateService);
  private readonly el = inject(ElementRef<HTMLElement>);
  private sub?: Subscription;
  protected readonly current = signal<SupportedLang>('en');
  protected readonly options = computed(() => this.langService.supported);
  protected readonly open = signal(false);

  /** Country code for the current language (for flag display). */
  protected readonly currentCountryCode = computed(() => LANG_TO_COUNTRY[this.current()]);

  protected getCountryCode(lang: SupportedLang): string {
    return LANG_TO_COUNTRY[lang];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.el.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  ngOnInit(): void {
    this.current.set(this.langService.currentLang);
    this.sub = this.translate.onLangChange.subscribe(() => {
      this.current.set(this.langService.currentLang);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  protected toggle(): void {
    this.open.update((v) => !v);
  }

  protected selectLang(lang: SupportedLang): void {
    this.langService.setLang(lang);
    this.current.set(lang);
    this.open.set(false);
  }
}
