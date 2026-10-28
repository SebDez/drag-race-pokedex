import {
  Component,
  DOCUMENT,
  ElementRef,
  Inject,
  Injector,
  OnDestroy,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  FRANCHISE_NAMES,
  SEASONS_PER_FRANCHISE,
} from '@app/core/contestants/constants/franchises.constants';
import { DEFAULT_CONTESTANT_FILTERS } from '@app/core/contestants/models/contestant-view.model';
import { ContestantFilters } from '@app/core/contestants/models/query.model';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

@Component({
  selector: 'app-contestant-list-advanced-filters',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './contestant-list-advanced-filters.component.html',
})
export class ContestantListAdvancedFiltersComponent implements OnDestroy {
  private readonly openFiltersBtnRef = viewChild<ElementRef<HTMLButtonElement>>('openFiltersBtn');
  private readonly dialogRootRef = viewChild<ElementRef<HTMLElement>>('dialogRoot');
  private readonly dialogPanelRef = viewChild<ElementRef<HTMLElement>>('dialogPanel');
  private readonly injector = inject(Injector);

  private inertTargets: HTMLElement[] = [];
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  readonly filters = input<ContestantFilters>(DEFAULT_CONTESTANT_FILTERS);
  readonly filtersChange = output<ContestantFilters>();
  readonly resetAllFilters = output<void>();

  protected readonly dialogOpen = signal(false);
  protected readonly dialogTitleId = 'contestant-filters-dialog-title';

  protected readonly franchiseNames = computed(() => FRANCHISE_NAMES);

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    effect(() => {
      if (!this.dialogOpen()) {
        this.teardownDialogA11y();
        return;
      }

      afterNextRender(
        () => {
          if (!this.dialogOpen()) {
            return;
          }
          this.setupDialogA11y();
        },
        { injector: this.injector },
      );
    });
  }

  ngOnDestroy(): void {
    this.teardownDialogA11y();
  }

  protected hasActiveFilters(): boolean {
    const f = this.filters();
    return f.winnersOnly || (f.franchiseSeasonKeys?.length ?? 0) > 0;
  }

  protected openDialog(): void {
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void {
    this.dialogOpen.set(false);
    setTimeout(() => this.openFiltersBtnRef()?.nativeElement?.focus(), 0);
  }

  protected onResetAllClick(): void {
    this.resetAllFilters.emit();
    this.closeDialog();
  }

  protected allFranchisesSelected(): boolean {
    return (this.filters().franchiseSeasonKeys?.length ?? 0) === 0;
  }

  protected clearFranchiseFilters(): void {
    if (this.allFranchisesSelected()) {
      return;
    }
    const current = this.filters();
    this.filtersChange.emit({
      ...current,
      franchiseSeasonKeys: [],
    });
  }

  protected seasonsForFranchise(franchise: string): number[] {
    const total = SEASONS_PER_FRANCHISE[franchise] ?? 0;
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  protected isFranchiseSelected(franchise: string): boolean {
    const key = this.franchiseKey(franchise);
    return this.filters().franchiseSeasonKeys?.includes(key) ?? false;
  }

  protected isSeasonSelected(franchise: string, season: number): boolean {
    const key = this.seasonKey(franchise, season);
    return this.filters().franchiseSeasonKeys?.includes(key) ?? false;
  }

  protected onToggleWinners(event: Event): void {
    const checked = (event.target as HTMLInputElement | null)?.checked ?? false;
    const current = this.filters();
    this.filtersChange.emit({
      ...current,
      winnersOnly: checked,
    });
  }

  protected onToggleFranchise(franchise: string, event: Event): void {
    const checked = (event.target as HTMLInputElement | null)?.checked ?? false;
    const key = this.franchiseKey(franchise);
    const current = this.filters();
    const currentKeys = current.franchiseSeasonKeys ?? [];

    let nextKeys: string[];
    if (checked) {
      nextKeys = [...currentKeys, key].filter(
        (value, index, array) => array.indexOf(value) === index,
      );
    } else {
      nextKeys = currentKeys.filter((k) => k !== key);
    }

    this.filtersChange.emit({
      ...current,
      franchiseSeasonKeys: nextKeys,
    });
  }

  protected onToggleSeason(franchise: string, season: number, event: Event): void {
    const checked = (event.target as HTMLInputElement | null)?.checked ?? false;
    const key = this.seasonKey(franchise, season);
    const current = this.filters();
    const currentKeys = current.franchiseSeasonKeys ?? [];

    let nextKeys: string[];
    if (checked) {
      nextKeys = [...currentKeys, key].filter(
        (value, index, array) => array.indexOf(value) === index,
      );
    } else {
      nextKeys = currentKeys.filter((k) => k !== key);
    }

    this.filtersChange.emit({
      ...current,
      franchiseSeasonKeys: nextKeys,
    });
  }

  private franchiseKey(franchise: string): string {
    return `franchise::${franchise}`;
  }

  private seasonKey(franchise: string, season: number): string {
    return `season::${franchise}::${season}`;
  }

  private setupDialogA11y(): void {
    const root = this.dialogRootRef()?.nativeElement;
    const panel = this.dialogPanelRef()?.nativeElement;
    if (!root || !panel) {
      return;
    }

    // Move overlay to <body> so we can inert the whole app-root safely.
    if (root.parentElement !== this.document.body) {
      this.document.body.appendChild(root);
    }

    this.teardownInertOnly();
    const appRoot = this.document.querySelector('app-root');
    if (appRoot instanceof HTMLElement) {
      appRoot.inert = true;
      this.inertTargets = [appRoot];
    }
    this.document.body.style.overflow = 'hidden';

    this.keydownHandler = (e: KeyboardEvent) => this.onDialogKeydown(e, panel);
    this.document.addEventListener('keydown', this.keydownHandler);

    const focusables = this.getFocusableElements(panel);
    (focusables[0] ?? panel).focus();
  }

  private teardownDialogA11y(): void {
    if (this.keydownHandler) {
      this.document.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    this.teardownInertOnly();
    this.document.body.style.overflow = '';
  }

  private teardownInertOnly(): void {
    for (const el of this.inertTargets) {
      el.inert = false;
    }
    this.inertTargets = [];
  }

  private onDialogKeydown(e: KeyboardEvent, panel: HTMLElement): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.closeDialog();
      return;
    }
    if (e.key !== 'Tab') {
      return;
    }

    const focusables = this.getFocusableElements(panel);
    if (focusables.length === 0) {
      e.preventDefault();
      panel.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = this.document.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      if (active === first || !panel.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last || !panel.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    return [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
      (el) => !el.hasAttribute('disabled') && el.getClientRects().length > 0,
    );
  }
}
