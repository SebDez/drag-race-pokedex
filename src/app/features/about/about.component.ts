import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AppInfoService } from '@app/core/app-info/app-info.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [TranslateModule, DatePipe],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  protected readonly info = inject(AppInfoService);
}
