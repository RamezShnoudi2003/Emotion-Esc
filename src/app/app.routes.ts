import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { HomeComponent } from './Components/home/home.component';
import { LetsEscapeComponent } from './Components/lets-escape/lets-escape.component';
import { LibraryComponent } from './Components/library/library.component';
import { MovieDetailsComponent } from './Components/movies/movie-details/movie-details.component';
import { MoviesComponent } from './Components/movies/movies.component';
import { OnboardingComponent } from './Components/onboarding/onboarding.component';
import { ProfileComponent } from './Components/profile/profile.component';
import { SignupComponent } from './Components/signup/signup.component';
import { SongsComponent } from './Components/songs/songs.component';
import { authGuard } from './Guards/auth.guard';
import { loginGuard } from './Guards/login.guard';
import { ShowAllComponent } from './Components/show-all/show-all.component';
import { ResetComponent } from './Components/reset/reset.component';
import { resetGuard } from './Guards/reset.guard';

export const routes: Routes = [
  {
    path: 'reset/:token',
    component: ResetComponent,
    canActivate: [resetGuard],
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'sign-up', component: SignupComponent, canActivate: [loginGuard] },
  {
    path: 'on-boarding',
    component: OnboardingComponent,
    canActivate: [loginGuard],
  },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'songs', component: SongsComponent },
      { path: 'movies', component: MoviesComponent },
      { path: 'show-all', component: ShowAllComponent },
      { path: 'movie-details', component: MovieDetailsComponent },
      { path: 'lets-escape', component: LetsEscapeComponent },
      { path: 'library', component: LibraryComponent },
      { path: 'profile', component: ProfileComponent },
    ],
  },
  { path: '**', redirectTo: '/home' },
];
