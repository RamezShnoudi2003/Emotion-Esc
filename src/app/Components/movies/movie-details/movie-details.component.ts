import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from '../../../UIComponents/button/button.component';
import { MovieBoxComponent } from '../../../UIComponents/movie-box/movie-box.component';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MoviesService } from '../../../Services/API/movies.service';
import { PersistDataService } from '../../../Services/persist-data.service';
import { LibraryService } from '../../../Services/API/library.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../Services/language.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [ButtonComponent, MovieBoxComponent, NgFor, NgIf, TranslateModule],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css',
})
export class MovieDetailsComponent implements OnInit {
  emotion: string = '';
  recievedMovie: any;
  movieDetails: any;
  state: any;
  formattedDuration: any;
  movieRecommendations: any;
  language: string = '';
  genres: any;

  isDetailsLoading: boolean = false;
  isRecommendationsLoading: boolean = false;

  showTrailerBtn: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly moviesService: MoviesService,
    private readonly libraryService: LibraryService,
    private readonly languageService: LanguageService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly location: Location
  ) {}

  ngOnInit(): void {
    this.languageService.language$.subscribe({
      next: (response: string) => {
        this.language = response;
      },
    });

    console.log(window.history.state);

    this.recievedMovie = window.history.state;

    this.activatedRoute.paramMap.subscribe((params) => {
      const movieId = params.get('id') || '';
      this.getMovieDetails(movieId);
    });

    this.getMovieRecommendations();
  }

  getMovieDetails(id: string) {
    this.isDetailsLoading = true;

    this.moviesService.getMovieDetails(id).subscribe({
      next: (response: any) => {
        this.movieDetails = response.data;
        console.log(this.movieDetails.id);
        this.movieDetails.isSelected = false;

        let model = {
          type: 'movie',
          search: '',
        };

        this.libraryService.getLibrary(model).subscribe({
          next: (libraryResponse: any) => {
            if (libraryResponse) {
              console.log(libraryResponse);

              libraryResponse.data.items.forEach((item: any) => {
                console.log(item);
                if (item.itemId === this.movieDetails.id.toString()) {
                  console.log('matched');
                  this.movieDetails.isSelected = true;
                }
              });

              console.log(this.movieDetails);
            }
          },
        });

        let hours = Math.floor(response.data.runtime / 60); // Get full hours
        let minutes = response.data.runtime % 60; // Get the remaining minutes

        this.formattedDuration = hours + ':' + minutes;

        this.genres = response.data.genres;

        this.isDetailsLoading = false;

        this.movieDetails.trailers.length === 0
          ? (this.showTrailerBtn = false)
          : (this.showTrailerBtn = true);
      },
      error: (serverError) => {
        this.isDetailsLoading = false;
      },
    });
  }

  getMovieRecommendations() {
    this.isRecommendationsLoading = true;

    let model = {
      emotion: this.emotion,
      page: 1,
    };
    this.moviesService.getMovieRecommendations(model).subscribe({
      next: (response: any) => {
        this.movieRecommendations = response.data.results;
        this.isRecommendationsLoading = false;
      },
      error: (serverError) => {
        this.isRecommendationsLoading = false;
      },
    });
  }

  takeToDescription(item: any) {
    // this enforces route to redirect with the new state because if we are on the same screen and tried to navigate to it with different data it wont change
    // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    this.moviesService.takeToDescription(item.id);
    // });
  }

  watchTrailer(movie: any) {
    console.log(movie);
    console.log(movie.trailers[0]);

    window.open(
      'https://www.youtube.com/embed/' + movie.trailers[0].key,
      '_blank'
    );
  }

  handleAddRemoveToFromLibrary() {
    if (this.movieDetails.isSelected) {
      this.removeItemFromLibrary();
    } else {
      this.addItemToLibrary();
    }
  }

  addItemToLibrary() {
    this.movieDetails.isSelected = true;

    let model = {
      itemId: this.movieDetails.id,
      itemType: 'movie',
      title: this.movieDetails.original_title,
      artistOrDirector: '',
      itemImage: this.movieDetails.poster_path,
      releaseDate: this.movieDetails.release_date,
    };

    this.libraryService.addItemToLibrary(model).subscribe({
      next: (response: any) => {
        console.log('add to library ', response);
      },
    });
  }

  removeItemFromLibrary() {
    this.movieDetails.isSelected = false;

    this.libraryService.removeItemFromLibrary(this.movieDetails.id).subscribe({
      next: (response: any) => {
        console.log(response);
      },
    });
  }

  showAll(type: string) {
    // we set 'all-emotion' even tho
    //  we already have 'emotion' saved in persistDataService
    // because we remove all-emotion when leaving show-all screen
    // but we wanna keep emotion
    this.router.navigate(['show-all'], { queryParams: { type } });
  }

  back() {
    this.location.back();
  }
}
