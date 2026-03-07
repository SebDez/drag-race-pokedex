import { Component, inject, OnInit, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ContestantsStore } from '../../store/contestants.store';
import { ContestantListComponent } from '../../components/contestant-list/contestant-list.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslateModule, ContestantListComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  protected readonly store = inject(ContestantsStore);

  protected readonly visibleContestants = computed(() => this.store.contestants());

  ngOnInit(): void {
    this.store.loadContestants();
  }
}
