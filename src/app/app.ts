import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LangService } from './core/lang.service';
import { LangSelectorComponent } from './shared/ui/lang-selector/lang-selector.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LangSelectorComponent, TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  constructor(private readonly langService: LangService) {
    this.langService.initLang();
  }
}
