import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  GroupMode,
  type ContestantGroupMode,
} from '@app/core/contestants/constants/group-mode.constants';
import {
  SortMode,
  type ContestantSortMode,
} from '@app/core/contestants/constants/sort-mode.constants';
import {
  DEFAULT_CONTESTANT_FILTERS,
  type ContestantFilters,
} from '@app/core/contestants/models/contestant-view.model';

interface FilterRecapItem {
  key: string;
  /** Single i18n key with optional interpolate params */
  labelKey?: string;
  params?: Record<string, string>;
  /** Prefix + nested value both translated (group/sort) */
  prefixKey?: string;
  valueKey?: string;
  /** Raw text (already resolved) */
  label?: string;
}

@Component({
  selector: 'app-contestant-list-empty',
  standalone: true,
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/70 px-5 py-10 text-center"
      role="status"
      data-testid="contestant-list-empty"
    >
      <div
        class="flex size-14 items-center justify-center rounded-full bg-[var(--color-pink)]/10 text-[var(--color-pink-dark)]"
        aria-hidden="true"
      >
        <svg
          class="size-7"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>

      <div class="flex flex-col gap-1.5 max-w-sm">
        <p class="m-0 text-base font-semibold text-[var(--color-text)]">
          {{ 'home.noResultsTitle' | translate }}
        </p>
        <p class="m-0 text-sm text-[var(--color-text-muted)] leading-relaxed">
          {{ 'home.noResultsHint' | translate }}
        </p>
      </div>

      @if (recapItems().length) {
        <div class="w-full max-w-md text-left">
          <p
            class="m-0 mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
          >
            {{ 'home.currentFilters' | translate }}
          </p>
          <ul class="m-0 flex list-none flex-col gap-1.5 p-0" data-testid="empty-filter-recap">
            @for (item of recapItems(); track item.key) {
              <li
                class="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-text)]"
              >
                @if (item.prefixKey && item.valueKey) {
                  <span class="text-[var(--color-text-muted)]"
                    >{{ item.prefixKey | translate }} ·
                  </span>
                  {{ item.valueKey | translate }}
                } @else if (item.labelKey) {
                  {{ item.labelKey | translate: item.params }}
                } @else {
                  {{ item.label }}
                }
              </li>
            }
          </ul>
        </div>
      }

      <button
        type="button"
        data-testid="empty-reset-filters"
        class="mt-1 inline-flex items-center justify-center rounded-full border border-[var(--color-pink)] bg-[var(--color-pink)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-pink)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-pink)]"
        (click)="resetAllFilters.emit()"
      >
        {{ 'filters.resetAll' | translate }}
      </button>
    </div>
  `,
})
export class ContestantListEmptyComponent {
  readonly filters = input<ContestantFilters>(DEFAULT_CONTESTANT_FILTERS);
  readonly groupMode = input<ContestantGroupMode>(GroupMode.All);
  readonly sortMode = input<ContestantSortMode>(SortMode.DragNameAsc);
  readonly resetAllFilters = output<void>();

  protected readonly recapItems = computed((): FilterRecapItem[] => {
    const f = this.filters();
    const items: FilterRecapItem[] = [];
    const search = (f.searchQuery ?? '').trim();

    if (search) {
      items.push({
        key: 'search',
        labelKey: 'home.filterRecap.search',
        params: { query: search },
      });
    }
    if (f.winnersOnly) {
      items.push({ key: 'winners', labelKey: 'filters.winnersOnly' });
    }
    for (const key of f.franchiseSeasonKeys ?? []) {
      if (key.startsWith('franchise::')) {
        items.push({
          key,
          labelKey: 'home.filterRecap.franchise',
          params: { name: key.slice('franchise::'.length) },
        });
      } else if (key.startsWith('season::')) {
        const rest = key.slice('season::'.length);
        const sep = rest.lastIndexOf('::');
        if (sep > 0) {
          items.push({
            key,
            labelKey: 'home.filterRecap.season',
            params: {
              franchise: rest.slice(0, sep),
              season: rest.slice(sep + 2),
            },
          });
        }
      }
    }
    if (this.groupMode() !== GroupMode.All) {
      const valueKey =
        this.groupMode() === GroupMode.Alphabetical
          ? 'groupBy.alphabetical'
          : this.groupMode() === GroupMode.Franchise
            ? 'groupBy.franchise'
            : 'groupBy.franchiseAndSeasons';
      items.push({
        key: 'group',
        prefixKey: 'groupBy.label',
        valueKey,
      });
    }
    if (this.sortMode() !== SortMode.DragNameAsc) {
      items.push({
        key: 'sort',
        prefixKey: 'sortBy.label',
        valueKey: 'sortBy.challengeWinsDesc',
      });
    }
    return items;
  });
}
