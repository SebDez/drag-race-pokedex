import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  HostListener,
  Injector,
  OnDestroy,
  OnInit,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ContestantsStore } from '@app/core/contestants/store/contestant.store';
import { Contestant } from '@app/core/contestants/models/contestant.model';
import { ContestantSectionSeason } from '@app/core/contestants/models/contestant-view.model';
import { ContestantListComponent } from './components/contestant-list/contestant-list.component';
import { ContestantListEmptyComponent } from './components/contestant-list/contestant-list-empty.component';
import { ContestantListFiltersComponent } from './components/contestant-list/contestant-filters/contestant-list-filters.component';
import { ContestantDetailComponent } from './components/contestant-list/contestant-detail/contestant-detail.component';
import { type ContestantSelectEvent } from './components/contestant-list/contestant-card/contestant-card.component';
import {
  GroupMode,
  type ContestantGroupMode,
} from '@app/core/contestants/constants/group-mode.constants';
import { type ContestantSortMode } from '@app/core/contestants/constants/sort-mode.constants';
import { type ContestantFilters } from '@app/core/contestants/models/query.model';
import { CrownIconComponent } from '@app/shared/icons/crown-icon.component';
import { TrophyIconComponent } from '@app/shared/icons/trophy-icon.component';
import { ImageLightboxService } from '@app/shared/ui/image-lightbox/image-lightbox.service';

const DESKTOP_MQ = '(min-width: 1024px)';
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function readDesktopMatch(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(DESKTOP_MQ).matches;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TranslateModule,
    ContestantListComponent,
    ContestantListEmptyComponent,
    ContestantListFiltersComponent,
    ContestantDetailComponent,
    CrownIconComponent,
    TrophyIconComponent,
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly lightbox = inject(ImageLightboxService);
  private scrollScheduled = false;
  private inertTargets: HTMLElement[] = [];
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  private readonly backBtnRef = viewChild<ElementRef<HTMLButtonElement>>('backBtn');
  private readonly detailDialogRootRef = viewChild<ElementRef<HTMLElement>>('detailDialogRoot');
  private readonly detailDialogPanelRef = viewChild<ElementRef<HTMLElement>>('detailDialogPanel');

  protected readonly skeletonSlots = [0, 1, 2, 3, 4, 5] as const;
  protected readonly detailDialogTitleId = 'home-detail-dialog-title';

  protected readonly isDesktop = signal(readDesktopMatch());
  protected readonly selectedContestant = signal<Contestant | null>(null);
  protected readonly selectedDisplayedSeason = signal<ContestantSectionSeason | undefined>(
    undefined,
  );

  protected readonly showMobileDetail = computed(() => {
    if (this.isDesktop()) {
      return null;
    }
    return this.selectedContestant();
  });

  protected readonly displayedCount = computed(() => {
    const vm = this.store.viewModel();
    if (vm.mode === GroupMode.All) {
      return vm.list.length;
    }
    return vm.sections?.reduce((sum, section) => sum + section.contestants.length, 0) ?? 0;
  });

  protected readonly showPartialCount = computed(() => {
    const total = this.store.filteredCount();
    const shown = this.displayedCount();
    return total > 0 && shown > 0 && shown < total;
  });

  constructor(protected readonly store: ContestantsStore) {
    afterNextRender(() => {
      if (typeof window.matchMedia !== 'function') {
        return;
      }
      const mq = window.matchMedia(DESKTOP_MQ);
      this.isDesktop.set(mq.matches);
      const onChange = (e: MediaQueryListEvent) => this.isDesktop.set(e.matches);
      mq.addEventListener('change', onChange);
      this.destroyRef.onDestroy(() => mq.removeEventListener('change', onChange));
    });

    effect(() => {
      if (!this.showMobileDetail()) {
        this.teardownDetailDialogA11y();
        return;
      }
      afterNextRender(
        () => {
          if (!this.showMobileDetail()) {
            return;
          }
          this.setupDetailDialogA11y();
        },
        { injector: this.injector },
      );
    });
  }

  ngOnDestroy(): void {
    this.teardownDetailDialogA11y();
  }

  protected onGroupModeChange(mode: ContestantGroupMode): void {
    this.store.setGroupMode(mode);
  }

  protected onSortModeChange(mode: ContestantSortMode): void {
    this.store.setSortMode(mode);
  }

  protected onFiltersChange(filters: ContestantFilters): void {
    this.store.setFilters(filters);
  }

  protected onResetAllFilters(): void {
    this.store.resetAllFilters();
    this.clearSelection();
  }

  protected onSelectContestant(event: ContestantSelectEvent): void {
    this.selectedContestant.set(event.contestant);
    this.selectedDisplayedSeason.set(event.displayedSeason);
  }

  protected clearSelection(): void {
    this.selectedContestant.set(null);
    this.selectedDisplayedSeason.set(undefined);
  }

  protected onListPaneScroll(event: Event): void {
    if (!this.isDesktop()) {
      return;
    }
    const el = event.target as HTMLElement | null;
    if (!el) {
      return;
    }
    this.maybeLoadMore(el.scrollTop + el.clientHeight, el.scrollHeight);
  }

  ngOnInit(): void {
    this.store.loadContestants();
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    if (this.isDesktop() || this.showMobileDetail()) {
      return;
    }
    this.maybeLoadMore(window.scrollY + window.innerHeight, document.documentElement.scrollHeight);
  }

  private maybeLoadMore(scrollBottom: number, scrollHeight: number): void {
    if (this.scrollScheduled) {
      return;
    }
    this.scrollScheduled = true;
    requestAnimationFrame(() => {
      this.scrollScheduled = false;
      const store = this.store;
      if (store.loading() || store.loadingMore() || !store.hasMore()) {
        return;
      }
      const marginPx = 320;
      if (scrollBottom >= scrollHeight - marginPx) {
        store.loadMore();
      }
    });
  }

  private setupDetailDialogA11y(): void {
    const root = this.detailDialogRootRef()?.nativeElement;
    const panel = this.detailDialogPanelRef()?.nativeElement;
    if (!root || !panel) {
      return;
    }

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

    this.keydownHandler = (e: KeyboardEvent) => this.onDetailDialogKeydown(e, panel);
    this.document.addEventListener('keydown', this.keydownHandler);

    queueMicrotask(() => this.backBtnRef()?.nativeElement?.focus());
  }

  private teardownDetailDialogA11y(): void {
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

  private onDetailDialogKeydown(e: KeyboardEvent, panel: HTMLElement): void {
    if (e.key === 'Escape') {
      // Let the image lightbox consume Escape when it is open above this dialog.
      if (this.lightbox.active()) {
        return;
      }
      e.preventDefault();
      this.clearSelection();
      return;
    }
    if (e.key !== 'Tab') {
      return;
    }

    const focusables = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
      (el) => !el.hasAttribute('disabled') && el.getClientRects().length > 0,
    );
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
}
