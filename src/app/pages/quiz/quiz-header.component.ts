import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TrophyIconComponent } from '../../components/icons/trophy-icon.component';

@Component({
  selector: 'app-quiz-header',
  standalone: true,
  imports: [TranslateModule, TrophyIconComponent],
  templateUrl: './quiz-header.component.html',
})
export class QuizHeaderComponent {}

