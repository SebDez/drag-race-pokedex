import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ContestantsStore } from '../../store/contestants.store';
import { ContestantGridComponent } from '../../components/contestant-grid/contestant-grid.component';
import { ObserveVisibleDirective } from '../../shared/observe-visible.directive';

const PAGE_SIZE = 96;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslateModule, ContestantGridComponent, ObserveVisibleDirective],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  protected readonly store = inject(ContestantsStore);

  /** Nombre de contestants affichés (chargement progressif). */
  private readonly contestantsVisibleCount = signal(PAGE_SIZE);

  protected readonly visibleContestants = computed(() =>
    this.store.contestants().slice(0, this.contestantsVisibleCount()),
  );

  protected readonly hasMore = computed(() => this.contestantsVisibleCount() < this.store.count());

  ngOnInit(): void {
    this.store.loadContestants();
  }

  protected loadMore(): void {
    this.contestantsVisibleCount.update((n) => Math.min(n + PAGE_SIZE, this.store.count()));
  }
}
