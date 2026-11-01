import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  viewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FRANCHISE_NAMES } from '@app/core/contestants/constants/franchises.constants';
import { type AnswerMode } from '@app/core/quiz/models/quiz.model';
import { QuizStore } from '@app/core/quiz/store/quiz.store';

@Component({
  selector: 'app-quiz-setup',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './quiz-setup.component.html',
  styleUrl: './quiz-setup.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizSetupComponent {
  private readonly customPanel = viewChild<ElementRef<HTMLElement>>('customPanel');

  protected readonly franchiseNames = FRANCHISE_NAMES;
  protected readonly introModes: AnswerMode[] = ['duo', 'square', 'cash'];

  constructor(
    protected readonly store: QuizStore,
    private readonly injector: Injector,
  ) {}

  protected onQuickStart(): void {
    this.store.startQuick();
  }

  protected onToggleCustom(): void {
    const opening = !this.store.showCustom();
    this.store.setShowCustom(opening);
    if (!opening) {
      return;
    }
    afterNextRender(
      () => {
        const panel = this.customPanel()?.nativeElement;
        if (!panel) {
          return;
        }
        panel.focus({ preventScroll: true });
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      },
      { injector: this.injector },
    );
  }

  protected onToggleFranchise(franchise: string): void {
    this.store.toggleFranchise(franchise);
  }

  protected onStartCustom(): void {
    this.store.startCustom();
  }

  protected isFranchiseSelected(franchise: string): boolean {
    return this.store.customFranchises().includes(franchise);
  }
}
