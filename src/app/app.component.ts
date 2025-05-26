import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TopBarComponent } from './UIComponents/top-bar/top-bar.component';
import { BottomBarComponent } from './UIComponents/bottom-bar/bottom-bar.component';
import { LanguageService } from './Services/language.service';
import { AccountService } from './Services/API/account.service';
import { SongPlayCardComponent } from './UIComponents/song-play-card/song-play-card.component';
import { BottomSongPlayBarComponent } from './UIComponents/bottom-song-play-bar/bottom-song-play-bar.component';
import { SpotifyService } from './Services/spotify.service';
import { PersistDataService } from './Services/persist-data.service';
import { MoviesService } from './Services/API/movies.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    TopBarComponent,
    BottomBarComponent,
    SongPlayCardComponent,
    BottomSongPlayBarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'EmotionEsc';

  constructor(
    private readonly languageService: LanguageService,
    private readonly router: Router,
    private readonly persistDataService: PersistDataService,
    private readonly accountService: AccountService,
    private readonly spotifyService: SpotifyService,
    private readonly movieService: MoviesService
  ) {}

  ngAfterViewInit(): void {
    // let movie: any = localStorage.getItem('selected-movie');
    // movie = JSON.parse(movie);
    // console.log(movie);
    // if (movie) {
    //   this.movieService.takeToDescription(movie.id);
    // }
  }

  ngOnInit(): void {
    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
          ? input.toString()
          : input.url;

      // If this is a request to Spotify's analytics endpoint, handle specially
      if (
        url.includes('cpapi.spotify.com') ||
        url.includes('event/item_before_load')
      ) {
        try {
          const response = await originalFetch(input, init);

          // If we get a 404 or 400, return a fake successful response
          if (response.status === 404 || response.status === 400) {
            console.log(
              `Intercepted ${response.status} response for ${url.split('?')[0]}`
            );
            return new Response(JSON.stringify({ success: true }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }
          return response;
        } catch (error) {
          console.log(`Intercepted fetch error for ${url.split('?')[0]}`);
          // Return a fake successful response instead of throwing
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      // Pass through normal requests
      return originalFetch(input, init);
    };

    this.languageFactory();
    let user: any = localStorage.getItem('user') || '{}';
    user = JSON.parse(user);

    let isSpotifyBtnClicked = localStorage.getItem('isSpotifyBtnClicked');

    if (isSpotifyBtnClicked === 'true') {
      //  add a check so this is not called on profile and when spotify button is clicked
      if (window.location.pathname.includes('profile')) {
        console.log(window.location.search.split('&'));
        let code = window.location.search.split('&')[0];
        code = code.split('=')[1];
        console.log(code);

        let state = window.location.search.split('&')[1];
        state = state.split('=')[1];
        console.log(state);

        let model = {
          code: code,
          state: state,
        };

        this.accountService.linkToSpotify(model).subscribe({
          next: (response: any) => {
            console.log('link to spotify ', response);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            this.spotifyService.setIsLinkedToSpotify(true);

            localStorage.setItem('isSpotifyBtnClicked', 'false');
          },
        });
      }
    }

    this.spotifyService.setIsLinkedToSpotify(user.linkToSpotify);

    this.persistDataService.restoreEmotion();
  }

  isOnBoardingOrLoginOrSignupScreenActive() {
    return (
      this.router.url.includes('on-boarding') ||
      this.router.url.includes('login') ||
      this.router.url.includes('sign-up')
    );
  }

  languageFactory() {
    let langExist = localStorage.getItem('language') || '';

    if (langExist) {
      this.languageService.updateLanguage(langExist);
    } else {
      this.languageService.languageInit();
    }
  }
}
