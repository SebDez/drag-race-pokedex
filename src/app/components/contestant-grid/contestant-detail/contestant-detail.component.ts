import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Contestant } from '../../../contestants/models/contestant';

@Component({
  selector: 'app-contestant-detail',
  standalone: true,
  imports: [NgOptimizedImage, TranslateModule],
  templateUrl: './contestant-detail.component.html',
  host: { class: 'col-span-full' },
})
export class ContestantDetailComponent {
  readonly contestant = input.required<Contestant>();
}
