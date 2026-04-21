import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LangService } from './core/lang.service';
import { LangSelectorComponent } from './shared/ui/lang-selector/lang-selector.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LangSelectorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(private readonly langService: LangService) {
    this.langService.initLang();
  }
}
