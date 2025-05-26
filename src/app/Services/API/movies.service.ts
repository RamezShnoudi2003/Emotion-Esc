import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, take } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LanguageService } from '../language.service';

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  private readonly baseUrl = environment.apiUrl + 'movies/';

  private readonly selectedMovieSubject: BehaviorSubject<any> =
    new BehaviorSubject<any>(null);

  selectedMovie$: Observable<any> = this.selectedMovieSubject.asObservable();

  lang: string = 'ar';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly languageService: LanguageService
  ) {
    this.languageService.language$.subscribe({
      next: (response: string) => {
        this.lang = response;
      },
    });
  }
  getPopularMovies(page: number) {
    return this.http
      .get(`${this.baseUrl}popular-movies?page=${page}&lang=${this.lang}`, {
        withCredentials: true,
      })
      .pipe(take(1));
  }

  getTopRatedMovies() {
    return this.http
      .get(`${this.baseUrl}top-rated-movies`, {
        withCredentials: true,
      })
      .pipe(take(1));
  }

  getMovieRecommendations(model: any) {
    return this.http
      .get(
        `${this.baseUrl}get-movie-recommendation?em=${model.emotion}&page=${model.page}&lang=${this.lang}`,
        {
          withCredentials: true,
        }
      )
      .pipe(take(1));
  }

  getMovieDetails(id: string) {
    return this.http
      .get(`${this.baseUrl}movie-details/${id}&lang=${this.lang}`, {
        withCredentials: true,
      })
      .pipe(take(1));
  }

  takeToDescription(movieId: any) {
    this.router.navigate(['/movie-details', movieId]);
  }
  // takeToDescription(item: any) {

  //   this.router.navigateByUrl('movie-details', { state: item });
  // }

  setSelectedMovie(value: any) {
    this.selectedMovieSubject.next(value);
  }
}
