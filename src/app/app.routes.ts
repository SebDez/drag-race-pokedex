import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { QuizComponent } from './features/quiz/quiz.component';
import { AboutComponent } from './features/about/about.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'quiz', component: QuizComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: '' },
];
