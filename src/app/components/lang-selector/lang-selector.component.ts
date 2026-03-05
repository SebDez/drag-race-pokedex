import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LangService, type SupportedLang } from '../../core/lang.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lang-selector',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './lang-selector.component.html',
})
export class LangSelectorComponent implements OnInit, OnDestroy {
  protected readonly langService = inject(LangService);
  private readonly translate = inject(TranslateService);
  private sub?: Subscription;
  protected readonly current = signal<SupportedLang>('en');
  protected readonly options = computed(() => this.langService.supported);

  ngOnInit(): void {
    this.current.set(this.langService.currentLang);
    this.sub = this.translate.onLangChange.subscribe(() => {
      this.current.set(this.langService.currentLang);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  protected selectLang(lang: SupportedLang): void {
    this.langService.setLang(lang);
    this.current.set(lang);
  }
}
