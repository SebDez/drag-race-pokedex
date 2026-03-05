import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LangService } from './core/lang.service';
import { LangSelectorComponent } from './components/lang-selector/lang-selector.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LangSelectorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly langService = inject(LangService);

  constructor() {
    this.langService.initLang();
  }
}
