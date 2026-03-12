import {
  Component,
  DOCUMENT,
  ElementRef,
  effect,
  inject,
  input,
  output,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FRANCHISE_NAMES, SEASONS_PER_FRANCHISE } from '../../../contestants/constants/franchises';
import { DEFAULT_CONTESTANT_FILTERS, type ContestantFilters } from '../../../store/contestants/types';

@Component({
  selector: 'app-contestant-list-advanced-filters',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './contestant-list-advanced-filters.component.html',
})
export class ContestantListAdvancedFiltersComponent {
  private readonly document = inject(DOCUMENT);
  private readonly openFiltersBtnRef = viewChild<ElementRef<HTMLButtonElement>>('openFiltersBtn');

  readonly filters = input<ContestantFilters>(DEFAULT_CONTESTANT_FILTERS);
  readonly filtersChange = output<ContestantFilters>();

  protected readonly dialogOpen = signal(false);
  protected readonly dialogTitleId = 'contestant-filters-dialog-title';

  protected readonly franchiseNames = computed(() => FRANCHISE_NAMES);

  constructor() {
    effect(() => {
      if (!this.dialogOpen()) {
        return;
      }
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          this.closeDialog();
        }
      };
      this.document.addEventListener('keydown', handler);
      return () => this.document.removeEventListener('keydown', handler);
    });
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
    // Restore focus to the open button for accessibility
    setTimeout(() => this.openFiltersBtnRef()?.nativeElement?.focus(), 0);
  }

  protected allFranchisesSelected(): boolean {
    return (this.filters().franchiseSeasonKeys?.length ?? 0) === 0;
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

  protected onToggleAllFranchises(event: Event): void {
    const checked = (event.target as HTMLInputElement | null)?.checked ?? false;
    const current = this.filters();
    if (checked) {
      this.filtersChange.emit({
        ...current,
        franchiseSeasonKeys: [],
      });
    }
    // When unchecked and already empty, no need to emit (no-op).
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
}
