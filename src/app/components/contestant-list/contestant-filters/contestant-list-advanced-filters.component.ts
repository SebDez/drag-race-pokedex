import { Component, input, output, computed, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FRANCHISE_NAMES, SEASONS_PER_FRANCHISE } from '../../../contestants/constants/franchises';
import { type ContestantFilters } from '../../../store/contestants/types';

@Component({
  selector: 'app-contestant-list-advanced-filters',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="h-full mb-4 text-sm flex flex-col justify-end gap-3 pb-4">
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-full border border-(--color-pink) bg-(--color-surface-elevated) px-3 py-1.5 text-(--color-text) text-sm hover:bg-(--color-pink)/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-pink) focus-visible:ring-offset-1 focus-visible:ring-offset-(--color-surface)"
        (click)="openDialog()"
        [attr.aria-label]="'filters.openDialog' | translate"
      >
        <span class="inline-flex size-4 shrink-0" aria-hidden="true">
          <svg
            class="size-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </span>
        {{ 'filters.label' | translate }}
        @if (hasActiveFilters()) {
          <span class="size-1.5 rounded-full bg-(--color-pink)" aria-hidden="true"></span>
        }
      </button>
    </div>

    @if (dialogOpen()) {
      <div
        class="fixed inset-0 z-40 flex items-center justify-center p-4"
        role="dialog"
        [attr.aria-modal]="true"
        [attr.aria-labelledby]="dialogTitleId"
      >
        <div class="absolute inset-0 bg-black/50" (click)="closeDialog()"></div>
        <div
          [id]="dialogTitleId"
          class="relative z-50 w-full max-w-md max-h-[85vh] flex flex-col rounded-xl border border-(--color-pink)/30 bg-(--color-surface) shadow-xl"
        >
          <div
            class="flex items-center justify-between shrink-0 border-b border-(--color-pink)/20 px-4 py-3"
          >
            <h2 class="text-base font-semibold text-(--color-text) m-0">
              {{ 'filters.label' | translate }}
            </h2>
            <button
              type="button"
              class="rounded-full p-1.5 text-(--color-text-muted) hover:bg-(--color-pink)/10 hover:text-(--color-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-pink)"
              (click)="closeDialog()"
              [attr.aria-label]="'filters.close' | translate"
            >
              <span class="size-5 block" aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="flex-1 overflow-auto p-4 flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-(--color-pink) text-(--color-pink) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-pink) focus-visible:ring-offset-1 focus-visible:ring-offset-(--color-surface)"
                  [checked]="filters().winnersOnly"
                  (change)="onToggleWinners($event)"
                />
                <span class="text-(--color-text)">{{ 'filters.winnersOnly' | translate }}</span>
              </label>

              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-(--color-pink) text-(--color-pink) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-pink) focus-visible:ring-offset-1 focus-visible:ring-offset-(--color-surface)"
                  [checked]="allFranchisesSelected()"
                  (change)="onToggleAllFranchises($event)"
                />
                <span class="text-(--color-text)">{{ 'filters.allFranchises' | translate }}</span>
              </label>
            </div>

            <div
              class="rounded-lg border border-(--color-pink)/40 bg-(--color-surface-elevated) max-h-64 overflow-auto px-3 py-2"
            >
              <p class="text-[11px] text-(--color-text-muted) mb-2">
                {{ 'filters.franchiseTreeHint' | translate }}
              </p>
              <div class="flex flex-col gap-1">
                @for (franchise of franchiseNames(); track franchise) {
                  <div class="flex flex-col gap-1">
                    <label class="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        class="h-4 w-4 rounded border-(--color-pink) text-(--color-pink) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-pink) focus-visible:ring-offset-1 focus-visible:ring-offset-(--color-surface)"
                        [checked]="isFranchiseSelected(franchise)"
                        (change)="onToggleFranchise(franchise, $event)"
                      />
                      <span class="text-[13px] text-(--color-text)">{{ franchise }}</span>
                    </label>

                    <div class="ml-6 flex flex-col gap-0.5">
                      @for (season of seasonsForFranchise(franchise); track season) {
                        <label class="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            class="h-3.5 w-3.5 rounded border-(--color-pink) text-(--color-pink) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-pink) focus-visible:ring-offset-1 focus-visible:ring-offset-(--color-surface)"
                            [checked]="isSeasonSelected(franchise, season)"
                            (change)="onToggleSeason(franchise, season, $event)"
                          />
                          <span class="text-[12px] text-(--color-text-muted)">
                            {{ 'filters.seasonShort' | translate: { season: season } }}
                          </span>
                        </label>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
          <div class="shrink-0 border-t border-(--color-pink)/20 px-4 py-3">
            <button
              type="button"
              class="w-full rounded-full border border-(--color-pink) bg-(--color-pink)/10 px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-pink)/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-pink)"
              (click)="closeDialog()"
            >
              {{ 'filters.close' | translate }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ContestantListAdvancedFiltersComponent {
  readonly filters = input<ContestantFilters>({
    winnersOnly: false,
    franchiseSeasonKeys: [],
  });
  readonly filtersChange = output<ContestantFilters>();

  protected readonly dialogOpen = signal(false);
  protected readonly dialogTitleId = 'contestant-filters-dialog-title';

  protected readonly franchiseNames = computed(() => FRANCHISE_NAMES);

  protected hasActiveFilters(): boolean {
    const f = this.filters();
    return f.winnersOnly || (f.franchiseSeasonKeys?.length ?? 0) > 0;
  }

  protected openDialog(): void {
    this.dialogOpen.set(true);
  }

  protected closeDialog(): void {
    this.dialogOpen.set(false);
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
    } else if ((current.franchiseSeasonKeys?.length ?? 0) === 0) {
      this.filtersChange.emit({
        ...current,
        franchiseSeasonKeys: [],
      });
    }
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
