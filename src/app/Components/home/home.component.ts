import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SongBoxComponent } from '../../UIComponents/song-box/song-box.component';
import { MovieBoxComponent } from '../../UIComponents/movie-box/movie-box.component';
import { NgFor, NgIf } from '@angular/common';
import { MoviesService } from '../../Services/API/movies.service';
import { SongsService } from '../../Services/API/songs.service';
import { SongPlayService } from '../../Services/song-play.service';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../UIComponents/button/button.component';
import { LibraryService } from '../../Services/API/library.service';
import { SpotifyService } from '../../Services/spotify.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TranslateModule,
    SongBoxComponent,
    MovieBoxComponent,
    NgFor,
    NgIf,
    ButtonComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  isSongsLoading: boolean = false;
  isMoviesLoading: boolean = false;
  popularMovies: any;
  tracks: any;
  emotion: string = '';

  constructor(
    private readonly moviesService: MoviesService,
    private readonly songsService: SongsService,
    private readonly songPlayService: SongPlayService,
    private readonly router: Router,
    private readonly libraryService: LibraryService,
    private readonly spotifyService: SpotifyService
  ) {}

  ngOnInit(): void {
    this.getPopularMovies();
    this.getTodaysTopMusic();
  }

  getPopularMovies(page: number = 1) {
    this.isMoviesLoading = true;
    this.moviesService.getPopularMovies(page).subscribe({
      next: (response: any) => {
        this.popularMovies = response.data.results;
        console.log(this.popularMovies);
        this.isMoviesLoading = false;
      },
      error: (serverError) => {
        this.isMoviesLoading = false;
      },
    });
  }

  takeToDescription(item: any) {
    // localStorage.setItem('selected-movie', JSON.stringify(item));

    this.moviesService.takeToDescription(item.id);
  }

  playSong(song: any) {
    this.songPlayService.setSong(song);
  }

  getTodaysTopMusic(page: number = 1) {
    this.isSongsLoading = true;

    this.songsService.getTodaysTopMusic(page).subscribe({
      next: (response: any) => {
        this.tracks = response.data.tracks;
        this.spotifyService.trackList = this.tracks;

        let model = {
          type: 'song',
          search: '',
        };

        let ids: any[] = [];

        this.libraryService.getLibrary(model).subscribe({
          next: (libraryResponse: any) => {
            if (libraryResponse) {
              console.log(libraryResponse);

              libraryResponse.data.items.forEach((item: any) => {
                ids.push(item.itemId);
              });

              this.tracks.forEach((item: any) => {
                if (item && item.uri) {
                  // Mark as selected if uri matches id in library
                  item.isSelected = ids.includes(item.uri);
                }
              });

              console.log(this.tracks);
            }
          },
        });

        console.log('todays top music ', this.tracks);

        this.isSongsLoading = false;
      },
      error: (serverError) => {
        this.isSongsLoading = false;
      },
    });
  }

  showAll(type: string) {
    this.router.navigate(['show-all'], { queryParams: { type } });
  }
}
