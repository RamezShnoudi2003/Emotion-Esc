import { Component, OnDestroy, OnInit } from '@angular/core';
import { PersistDataService } from '../../Services/persist-data.service';
import { SongsService } from '../../Services/API/songs.service';
import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { SongBoxComponent } from '../../UIComponents/song-box/song-box.component';
import { MoviesService } from '../../Services/API/movies.service';
import { MovieBoxComponent } from '../../UIComponents/movie-box/movie-box.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../UIComponents/button/button.component';
import { SongPlayService } from '../../Services/song-play.service';
import { TranslateModule } from '@ngx-translate/core';
import { LibraryService } from '../../Services/API/library.service';

@Component({
  selector: 'app-show-all',
  imports: [
    NgIf,
    JsonPipe,
    NgFor,
    SongBoxComponent,
    MovieBoxComponent,
    ButtonComponent,
    TranslateModule,
  ],
  templateUrl: './show-all.component.html',
  styleUrl: './show-all.component.css',
})
export class ShowAllComponent implements OnInit, OnDestroy {
  // emotion: string = '';
  tracks: any[] = [];
  movies: any[] = [];
  isLoading: boolean = true;
  type: string = '';
  count: number = 1;
  movieItems: any;
  songItems: any;

  constructor(
    private readonly persistDataService: PersistDataService,
    private readonly songsService: SongsService,
    private readonly moviesService: MoviesService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly songPlayService: SongPlayService,
    private readonly libraryService: LibraryService
  ) {}

  ngOnDestroy(): void {
    // this.persistDataService.removeItem('all-emotion');
  }

  ngOnInit(): void {
    this.type = String(this.activatedRoute.snapshot.queryParamMap.get('type'));

    // this.emotion = this.persistDataService.getItem('all-emotion') || '';
    // this.emotion = localStorage.getItem('emotion') || '';

    // if type of query param is songs
    if (this.type == 'songs') {
      // and pesistdataservice has an emotion saved in it
      // if (this.emotion.length !== 0) {
      // we get all songs based on mood
      this.getTodaysTopMusic(this.count);
      // and pesistdataservice has no emotion saved in it
      // } else {
      // we get all normal songs
      // this.getTodaysTopMusic();
      // }
    }
    // if type of query param is movies
    else if (this.type == 'movies') {
      // and pesistdataservice has an emotion saved in it
      // if (this.emotion.length !== 0) {
      // we get all movies based on mood
      // this.getMovieRecommendations();
      // }
      // and pesistdataservice has no emotion saved in it
      // else {
      // we get all normal movies
      this.getPopularMovies(this.count);
      // }
    } else if (this.type == 'favorite-movies') {
      this.getLibrary('movie');
    } else if (this.type == 'favorite-songs') {
      this.getLibrary('song');
    }
  }

  getLibrary(type: string) {
    let model = {
      type: type,
      search: '',
    };

    this.libraryService.getLibrary(model).subscribe({
      next: (response: any) => {
        if (type === 'song') {
          this.songItems = response.data.items;
          console.log('songs ', this.songItems);
          this.isLoading = false;
        } else if (type === 'movie') {
          // call apis with the returned favorite movie ids to get their details
          this.movieItems = response.data.items;
          this.movieItems.forEach((item: any) => {
            item.releaseDate = item.releaseDate.split('T')[0];
          });
          this.isLoading = false;

          console.log('movies ', this.movieItems);
        }
      },
    });
  }

  getPopularMovies(page: number) {
    this.moviesService.getPopularMovies(page).subscribe({
      next: (response: any) => {
        this.movies = response.data.results;
        this.isLoading = false;
      },
      error: (ServerError) => {
        this.isLoading = false;
      },
    });
  }

  getTodaysTopMusic(page: number) {
    this.songsService.getTodaysTopMusic(page).subscribe({
      next: (response: any) => {
        this.tracks = response.data.tracks;
        this.isLoading = false;
      },
      error: (ServerError) => {
        this.isLoading = false;
      },
    });
  }

  takeToDescription(item: any) {
    this.moviesService.takeToDescription(item);
  }

  playSong(song: any) {
    // window.location.href = `https://open.spotify.com/track/${song.id}`;
    if (!document.body.classList.contains('song-play-shown')) {
      document.body.classList.add('song-play-shown');
    }

    // let model = {
    //   song: song,
    //   accessToken: this.token,
    // };
    // console.log('sent  model', model);
    // this.songPlayService.setSong(model);
    this.songPlayService.setSong(song);
  }

  back() {
    let lastScreenUserWasOn = this.persistDataService.getItem('screen') || '';

    let selectedMovie = this.persistDataService.getItem('selected-movie') || '';
    if (lastScreenUserWasOn && selectedMovie) {
      this.router.navigateByUrl(lastScreenUserWasOn, { state: selectedMovie });
    } else {
      let tab = localStorage.getItem('tab') || '';
      this.router.navigateByUrl(tab);
    }
  }

  next() {
    this.count += 1;
    if (this.type == 'songs') {
      this.getTodaysTopMusic(this.count);
    } else if (this.type == 'movies') {
      this.getPopularMovies(this.count);
    }
  }

  prev() {
    if (this.count > 1) {
      this.count -= 1;
      if (this.type == 'songs') {
        this.getTodaysTopMusic(this.count);
      } else if (this.type == 'movies') {
        this.getPopularMovies(this.count);
      }
    }
  }
}
