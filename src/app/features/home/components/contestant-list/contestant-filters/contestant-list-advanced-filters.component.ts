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

export interface ActiveFilterChip {
  key: string;
  label: string;
  kind: 'winners' | 'franchise' | 'season';
}

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
  protected readonly expandedFranchises = signal<ReadonlySet<string>>(new Set());

  protected readonly franchiseNames = computed(() => FRANCHISE_NAMES);

  protected readonly activeChips = computed((): ActiveFilterChip[] => {
    const f = this.filters();
    const chips: ActiveFilterChip[] = [];
    if (f.winnersOnly) {
      chips.push({ key: 'winners', label: 'filters.winnersOnlyChip', kind: 'winners' });
    }
    for (const key of f.franchiseSeasonKeys ?? []) {
      if (key.startsWith('franchise::')) {
        const franchise = key.slice('franchise::'.length);
        chips.push({ key, label: franchise, kind: 'franchise' });
      } else if (key.startsWith('season::')) {
        const rest = key.slice('season::'.length);
        const sep = rest.lastIndexOf('::');
        if (sep > 0) {
          const franchise = rest.slice(0, sep);
          const season = rest.slice(sep + 2);
          chips.push({ key, label: `${franchise} S${season}`, kind: 'season' });
        }
      }
    }
    return chips;
  });

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
    this.seedExpandedFromActiveFilters();
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

  protected isFranchiseExpanded(franchise: string): boolean {
    return this.expandedFranchises().has(franchise);
  }

  protected toggleFranchiseExpanded(franchise: string): void {
    const next = new Set(this.expandedFranchises());
    if (next.has(franchise)) {
      next.delete(franchise);
    } else {
      next.add(franchise);
    }
    this.expandedFranchises.set(next);
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

  protected removeChip(chip: ActiveFilterChip): void {
    const current = this.filters();
    if (chip.kind === 'winners') {
      this.filtersChange.emit({ ...current, winnersOnly: false });
      return;
    }
    this.filtersChange.emit({
      ...current,
      franchiseSeasonKeys: (current.franchiseSeasonKeys ?? []).filter((k) => k !== chip.key),
    });
  }

  private seedExpandedFromActiveFilters(): void {
    const expanded = new Set<string>();
    for (const key of this.filters().franchiseSeasonKeys ?? []) {
      if (key.startsWith('season::')) {
        const rest = key.slice('season::'.length);
        const sep = rest.lastIndexOf('::');
        if (sep > 0) {
          expanded.add(rest.slice(0, sep));
        }
      }
    }
    this.expandedFranchises.set(expanded);
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
