import {
  Component,
  signal,
  computed,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LangService, type SupportedLang } from '@app/core/lang.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lang-selector',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="relative z-[100] shrink-0">
      <button
        type="button"
        class="flex items-center justify-center gap-2 rounded-full border border-(--color-pink) bg-(--color-surface-elevated) px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-(--color-text) shadow-sm hover:bg-(--color-pink)/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-pink) focus-visible:ring-offset-1 focus-visible:ring-offset-(--color-surface)"
        (click)="toggle()"
        [attr.aria-label]="'aria.language' | translate"
        [attr.aria-haspopup]="'menu'"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="menuId"
      >
        {{ current() }}
      </button>
      @if (open()) {
        <ul
          [id]="menuId"
          class="absolute right-0 top-full mt-1 min-w-[8rem] rounded-lg border border-(--color-pink)/40 bg-(--color-surface-elevated) py-1 shadow-lg"
          role="menu"
          [attr.aria-label]="'aria.language' | translate"
        >
          @for (opt of options(); track opt.code) {
            <li role="none">
              <button
                type="button"
                role="menuitem"
                class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-(--color-text) hover:bg-(--color-pink)/10 focus-visible:bg-(--color-pink)/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--color-pink)"
                [attr.aria-current]="current() === opt.code ? 'true' : null"
                (click)="selectLang(opt.code)"
              >
                <span class="w-6 text-xs font-semibold uppercase text-(--color-text-muted)">{{
                  opt.code
                }}</span>
                <span>{{ opt.label }}</span>
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class LangSelectorComponent implements OnInit, OnDestroy {
  private sub?: Subscription;
  protected readonly menuId = 'app-lang-menu';
  protected readonly current = signal<SupportedLang>('en');
  protected readonly options = computed<{ code: SupportedLang; label: string }[]>(
    () => this.langService.supported,
  );
  protected readonly open = signal<boolean>(false);

  constructor(
    protected readonly langService: LangService,
    private readonly translate: TranslateService,
    private readonly el: ElementRef<HTMLElement>,
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.el.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
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
