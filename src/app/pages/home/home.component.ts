import { Component, inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ContestantsStore } from '../../store/contestants.store';
import { ContestantGridComponent } from '../../components/contestant-grid/contestant-grid.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslateModule, ContestantGridComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  protected readonly store = inject(ContestantsStore);

  ngOnInit(): void {
    this.store.loadContestants();
  }
}
