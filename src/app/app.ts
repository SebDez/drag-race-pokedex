import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LangService } from './core/lang.service';
import { LangSelectorComponent } from './components/lang-selector/lang-selector.component';
import { CrownIconComponent } from './components/icons/crown-icon.component';
import { TrophyIconComponent } from './components/icons/trophy-icon.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LangSelectorComponent,
    CrownIconComponent,
    TrophyIconComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly langService = inject(LangService);

  constructor() {
    this.langService.initLang();
  }
}
