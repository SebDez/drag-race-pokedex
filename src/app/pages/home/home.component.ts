import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ContestantsStore } from '../../store/contestants.store';
import { ContestantListComponent } from '../../components/contestant-list/contestant-list.component';
import { ContestantListFiltersComponent } from '../../components/contestant-list/contestant-filters/contestant-list-filters.component';
import { ContestantGroupMode } from '../../components/contestant-list/contestant-group-mode';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslateModule, ContestantListComponent, ContestantListFiltersComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  protected readonly store = inject(ContestantsStore);

  protected readonly visibleContestants = computed(() => this.store.contestants());

  protected readonly groupMode = signal<ContestantGroupMode>('all');
  protected readonly isRefreshing = signal<boolean>(false);

  protected onGroupModeChange(mode: ContestantGroupMode): void {
    this.groupMode.set(mode);
    this.isRefreshing.set(true);
    setTimeout(() => this.isRefreshing.set(false), 200);
  }

  ngOnInit(): void {
    this.store.loadContestants();
  }
}
