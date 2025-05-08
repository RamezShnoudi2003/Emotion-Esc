import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MovieBoxComponent } from '../../UIComponents/movie-box/movie-box.component';
import { Router } from '@angular/router';
import { MoviesService } from '../../Services/API/movies.service';
import { PersistDataService } from '../../Services/persist-data.service';
import { ButtonComponent } from '../../UIComponents/button/button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [NgFor, MovieBoxComponent, NgIf, TranslateModule],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.css',
})
export class MoviesComponent implements OnInit {
  movieRecommendations: any[] = [];
  isMoviesLoading: boolean = false;
  emotion: string = '';
  count: number = 1;

  constructor(
    private readonly router: Router,
    private readonly moviesService: MoviesService,
    private readonly persistDataService: PersistDataService
  ) {}

  ngOnInit(): void {
    //page number recieved from details screen to reutn user to screen they were on
    let page = window.history.state[0] || 1;
    this.count = page;

    let emotion = '';

    this.persistDataService.emotion$.subscribe({
      next: (response: string) => {
        emotion = response;
      },
    });

    // let emotion = this.persistDataService.getItem('emotion');
    // console.log('Received emotion:', emotion);

    if (emotion) {
      this.emotion = emotion;
    }

    this.getMoviesRecommendations(this.count);
  }

  getMoviesRecommendations(count: number) {
    this.movieRecommendations = [];
    this.isMoviesLoading = true;

    let model = {
      emotion: this.emotion,
      page: this.count,
    };
    this.moviesService.getMovieRecommendations(model).subscribe({
      next: (response: any) => {
        this.movieRecommendations = response.data.results;
        console.log(this.movieRecommendations);
        this.isMoviesLoading = false;
      },
      error: (serverError) => {
        this.isMoviesLoading = false;
      },
    });
  }

  // showAll(type: string) {
  //   // we set 'all-emotion' even tho
  //   //  we already have 'emotion' saved in persistDataService
  //   // because we remove all-emotion when leaving show-all screen
  //   // but we wanna keep emotion
  //   this.persistDataService.setItem('all-emotion', this.emotion);
  //   this.router.navigate(['show-all'], { queryParams: { type } });
  // }

  takeToDescription(item: any) {
    this.persistDataService.setItem('selected-movie', item);
    this.persistDataService.setItem('page', this.count); // to send page to details screen, so details screen can resend it to oninit of this componenet to return users the pagination that they were on
    this.moviesService.takeToDescription(item);
  }

  next() {
    this.count += 1;
    this.getMoviesRecommendations(this.count);
  }

  prev() {
    if (this.count > 1) {
      this.count -= 1;
      this.getMoviesRecommendations(this.count);
    }
  }

  letsEsc() {
    this.router.navigateByUrl('lets-escape');
  }
}
