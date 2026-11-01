import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LangService } from './core/lang.service';
import { LangSelectorComponent } from './shared/ui/lang-selector/lang-selector.component';
import { ImageLightboxComponent } from './shared/ui/image-lightbox/image-lightbox.component';
import { ImageLightboxService } from './shared/ui/image-lightbox/image-lightbox.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LangSelectorComponent,
    TranslateModule,
    ImageLightboxComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly lightbox = inject(ImageLightboxService);

  constructor(private readonly langService: LangService) {
    this.langService.initLang();
  }
}
