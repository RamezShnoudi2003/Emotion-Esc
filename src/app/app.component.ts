import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { TopBarComponent } from './UIComponents/top-bar/top-bar.component';
import { BottomBarComponent } from './UIComponents/bottom-bar/bottom-bar.component';
import { LanguageService } from './Services/language.service';
import { AccountService } from './Services/API/account.service';
import { Observable } from 'rxjs';
import { SongPlayCardComponent } from './UIComponents/song-play-card/song-play-card.component';
import { BottomSongPlayBarComponent } from './UIComponents/bottom-song-play-bar/bottom-song-play-bar.component';
import { SpotifyService } from './Services/spotify.service';
import { PersistDataService } from './Services/persist-data.service';
import { TabService } from './Services/tab.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    TopBarComponent,
    BottomBarComponent,
    SongPlayCardComponent,
    BottomSongPlayBarComponent,
    NgIf,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'EmotionEsc';

  player: any;

  // isLoggedIn: boolean = false;

  // @HostListener('window:popstate', ['$event'])
  // onPopState(event: Event) {
  //   let tab = localStorage.getItem('tab') || 'home';

  //   this.tabService.setSelectedTab(tab);
  // }
  token: any;
  constructor(
    private readonly languageService: LanguageService,
    private readonly router: Router,
    private readonly persistDataService: PersistDataService,
    private readonly accountService: AccountService,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.languageFactory();

    this.persistDataService.restoreEmotion();

    // this.accountService.isUserLoggedIn().subscribe({
    //   next: (response: any) => {
    //     this.isLoggedIn = response;
    //   },
    // });

    // console.log('urlll ', window.location.pathname.includes('reset'));

    // // If the path includes 'reset', fetch the token from the route
    // if (window.location.pathname.includes('reset')) {
    //   this.token = window.location.search.split('=').at(1);
    //   if (this.token) {
    //     this.router.navigateByUrl(`/reset/${this.token}`);
    //     console.log(this.token);
    //   }
    // }
    // this.handleSpotify();
    // this.spotifyService.initializeSpotifyPlayer();

    // Check if we have the access token in the URL hash
    // this.spotifyService.getAccessTokenFromUrl();

    // Initialize the Spotify Player
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

// handleSpotify() {
//   let spotifyToken = localStorage.getItem('spotify_access_token');

//   if (!spotifyToken) {
//     // Capture the code from the query parameters after redirect from spotify
//     const urlParams = new URLSearchParams(window.location.search);
//     const authorizationCode = urlParams.get('code');

//     // Check if the authorization code exists
//     if (authorizationCode) {
//       // Store the code in localStorage
//       // localStorage.setItem('spotify_auth_code', authorizationCode); // Use sessionStorage if you prefer
//       this.exchangeCodeForToken(authorizationCode);
//     } else {
//       console.error('Authorization code not found in the URL');
//     }
//   } else {
//     this.spotifyService.initializeSpotifyPlayer().then((res) => {
//       console.log('initialization result ', res);
//     });
//   }
// }

// // Function to exchange the authorization code for an access token
// exchangeCodeForToken(authorizationCode: string): void {
//   const clientId = '9e299651fa6543618205a7bbeb29e944'; // Your Spotify Client ID
//   const clientSecret = '6c1a9aac7c244315969b9467ec81d526'; // Your Spotify Client Secret
//   const redirectUri = 'http://localhost:4200/'; // The same redirect URI used in the authorization request

//   // Spotify token endpoint
//   const tokenEndpoint = 'https://accounts.spotify.com/api/token';

//   // Prepare the request body
//   const body = new URLSearchParams();
//   body.append('grant_type', 'authorization_code');
//   body.append('code', authorizationCode);
//   body.append('redirect_uri', redirectUri);

//   // Prepare the headers, including Basic Authorization using client_id and client_secret
//   const headers = new Headers();
//   headers.append(
//     'Authorization',
//     'Basic ' + btoa(clientId + ':' + clientSecret)
//   );
//   headers.append('Content-Type', 'application/x-www-form-urlencoded');

//   // Send the POST request to Spotify to exchange the code for tokens
//   fetch(tokenEndpoint, {
//     method: 'POST',
//     body: body,
//     headers: headers,
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       if (data.access_token) {
//         console.log('Access Token:', data.access_token);
//         // Store the access token in localStorage or sessionStorage for future use
//         localStorage.setItem('spotify_access_token', data.access_token);

//         this.spotifyService.initializeSpotifyPlayer().then((res) => {
//           console.log('initialization result ', res);
//         });

//         // You can now use this token to make authorized Spotify API requests
//       } else {
//         console.error('Failed to exchange code for access token:', data);
//       }
//     })
//     .catch((error) => {
//       console.error('Error during token exchange:', error);
//     });
// }
