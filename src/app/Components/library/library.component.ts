import { Component } from '@angular/core';
import { MovieBoxComponent } from '../../UIComponents/movie-box/movie-box.component';
import { NgFor, NgIf } from '@angular/common';
import { SongBoxComponent } from '../../UIComponents/song-box/song-box.component';
import { MoviesService } from '../../Services/API/movies.service';
import { SongsService } from '../../Services/API/songs.service';
import { ButtonComponent } from '../../UIComponents/button/button.component';
import { Router } from '@angular/router';
import { PersistDataService } from '../../Services/persist-data.service';
import { TranslateModule } from '@ngx-translate/core';
import { LibraryService } from '../../Services/API/library.service';
import { SongPlayService } from '../../Services/song-play.service';
import { SpotifyService } from '../../Services/spotify.service';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [
    MovieBoxComponent,
    NgFor,
    SongBoxComponent,
    NgIf,
    ButtonComponent,
    TranslateModule,
  ],
  templateUrl: './library.component.html',
  styleUrl: './library.component.css',
})
export class LibraryComponent {
  emotion: string = '';

  showAll(type: string) {
    // we set 'all-emotion' even tho
    //  we already have 'emotion' saved in persistDataService
    // because we remove all-emotion when leaving show-all screen
    // but we wanna keep emotion
    this.router.navigate(['show-all'], { queryParams: { type } });
  }

  isSongsLoading: boolean = false;
  isMoviesLoading: boolean = false;
  movieRecommendations: any;
  songItems: any[] = [];
  movieItems: any[] = [];
  noSongsData: string = '';
  noMoviesData: string = '';

  constructor(
    private readonly moviesService: MoviesService,
    private readonly router: Router,
    private readonly libraryService: LibraryService,
    private readonly songPlayService: SongPlayService,
    private readonly spotifyService: SpotifyService
  ) {}

  ngOnInit(): void {
    this.getLibrary('movie');
    this.getLibrary('song');

    this.libraryService.addedRemovedSongFromLibraryTrigger$.subscribe({
      next: () => {
        this.getLibrary('song');
      },
    });
  }

  getLibrary(type: string) {
    if (type === 'song') {
      this.isSongsLoading = true;
    } else if (type === 'movie') {
      this.isMoviesLoading = true;
    }

    let model = {
      type: type,
      search: '',
    };

    this.libraryService.getLibrary(model).subscribe({
      next: (response: any) => {
        console.log(response.status === 'error');

        if (type === 'song') {
          if (response.status === 'error') {
            this.isSongsLoading = false;
            this.noSongsData = response.message;
            return;
          }
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
          this.isSongsLoading = false;
        } else if (type === 'movie') {
          if (response.status === 'error') {
            this.isMoviesLoading = false;
            this.noMoviesData = response.message;
            return;
          }
          this.isMoviesLoading = false;
          // call apis with the returned favorite movie ids to get their details
          this.movieItems = response.data.items;
          this.movieItems.forEach((item: any) => {
            item.releaseDate = item.releaseDate.split('T')[0];
          });
          console.log('movies ', this.movieItems);
        }
      },
    });
  }

  takeToDescription(item: any) {
    // the api to get movie details expects id as id not itemId
    let movieId = parseInt(item.itemId);
    this.moviesService.takeToDescription(movieId);
  }

  playSong(song: any) {
    // format sent from our library differs from what spng-play-card expects
    //this is the format that we wanna send to song play card
    let model = {
      name: song.title,
      artists: [song.artistOrDirector],
      images: [{ url: song.itemImage }],
      uri: song.itemId,
      // when selecting an item from library then by default its selected as favorites
      isSelected: true,
    };
    this.songPlayService.setSong(model);
  }
}
