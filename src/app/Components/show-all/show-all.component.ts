import { Component, OnDestroy, OnInit } from '@angular/core';
import { PersistDataService } from '../../Services/persist-data.service';
import { SongsService } from '../../Services/API/songs.service';
import { NgFor, NgIf } from '@angular/common';
import { SongBoxComponent } from '../../UIComponents/song-box/song-box.component';
import { MoviesService } from '../../Services/API/movies.service';
import { MovieBoxComponent } from '../../UIComponents/movie-box/movie-box.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SongPlayService } from '../../Services/song-play.service';
import { TranslateModule } from '@ngx-translate/core';
import { LibraryService } from '../../Services/API/library.service';
import { SpotifyService } from '../../Services/spotify.service';
import { Location } from '@angular/common';
import { InputComponent } from '../../UIComponents/input/input.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-show-all',
  imports: [
    NgIf,
    NgFor,
    SongBoxComponent,
    MovieBoxComponent,
    TranslateModule,
    InputComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './show-all.component.html',
  styleUrl: './show-all.component.css',
})
export class ShowAllComponent implements OnInit {
  tracks: any[] = [];
  movies: any[] = [];
  isLoading: boolean = true;
  type: string = '';
  count: number = 1;
  movieItems: any[] = [];
  songItems: any[] = [];
  message: string = '';

  searchFormGroup!: FormGroup<any>;
  constructor(
    private readonly persistDataService: PersistDataService,
    private readonly songsService: SongsService,
    private readonly moviesService: MoviesService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly songPlayService: SongPlayService,
    private readonly libraryService: LibraryService,
    private readonly spotifyService: SpotifyService,
    private location: Location,
    private readonly formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.type = String(this.activatedRoute.snapshot.queryParamMap.get('type'));

    // if type of query param is songs
    if (this.type == 'songs') {
      // and pesistdataservice has an emotion saved in it
      this.getTodaysTopMusic(this.count);
    }
    // if type of query param is movies
    else if (this.type == 'movies') {
      this.getPopularMovies(this.count);
    } else if (this.type == 'favorite-movies') {
      this.getLibrary('movie');
    } else if (this.type == 'favorite-songs') {
      this.getLibrary('song');
    }
  }

  initializeForm() {
    this.searchFormGroup = this.formBuilder.group({
      search: '',
    });
  }

  getLibrary(type: string, search: string = '') {
    this.isLoading = true;
    let model = {
      type: type,
      search: search,
    };

    this.libraryService.getLibrary(model).subscribe({
      next: (response: any) => {
        if (response.status === 'error') {
          this.movieItems = [];
          this.songItems = [];
          this.isLoading = false;
          this.message = response.message;
          return;
        }

        if (type === 'song') {
          this.songItems = response.data.items;

          this.songItems.forEach((item: any) => {
            item.name = item.title;
            item.artists = [item.artistOrDirector];
            item.images = [{ url: item.itemImage }];
            item.uri = item.itemId;
            // when selecting an item from library then by default its selected as favorites
            item.isSelected = true;
          });

          this.spotifyService.trackList = this.songItems;

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
      error: (serverError) => {
        this.isLoading = false;
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

  searchSongs() {
    let searchValue = this.searchFormGroup.value['search'];

    this.getLibrary('song', searchValue);
  }

  searchMovies() {
    let searchValue = this.searchFormGroup.value['search'];

    this.getLibrary('movie', searchValue);
  }

  getTodaysTopMusic(page: number) {
    this.songsService.getTodaysTopMusic(page).subscribe({
      next: (response: any) => {
        this.tracks = response.data.tracks;
        this.spotifyService.trackList = this.tracks;

        this.isLoading = false;
      },
      error: (ServerError) => {
        this.isLoading = false;
      },
    });
  }

  takeToDescription(item: any) {
    if (this.type == 'movies') {
      this.moviesService.takeToDescription(item.id);
    } else {
      let movieId = parseInt(item.itemId);
      this.moviesService.takeToDescription(movieId);
    }
  }

  playSong(song: any) {
    if (this.type === 'favorite-songs') {
      let model = {
        name: song.title,
        artists: [song.artistOrDirector],
        images: [{ url: song.itemImage }],
        uri: song.itemId,
        // when selecting an item from library then by default its selected as favorites
        isSelected: true,
      };
      song = model;
    }

    this.songPlayService.setSong(song);
  }

  back() {
    // let lastScreenUserWasOn = this.persistDataService.getItem('screen') || '';

    // let selectedMovie = this.persistDataService.getItem('selected-movie') || '';
    // if (lastScreenUserWasOn && selectedMovie) {
    //   this.router.navigateByUrl(lastScreenUserWasOn, { state: selectedMovie });
    // } else {
    //   let tab = localStorage.getItem('tab') || '';
    //   this.router.navigateByUrl(tab);
    // }

    this.location.back();
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
