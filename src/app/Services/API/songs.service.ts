import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, take } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SongsService {
  private readonly baseUrl = environment.apiUrl + 'music/';
  constructor(private readonly http: HttpClient) {}

  getMusicRecommendations(model: any): Observable<any> {
    return this.http
      .get(
        `${this.baseUrl}recommendations?em=${model.emotion}&page=${model.page}`,
        { withCredentials: true }
      )
      .pipe(take(1));
  }

  getTodaysTopMusic(page: number): Observable<any> {
    return this.http
      .get(`${this.baseUrl}todays-top-music?page=${page}`, {
        withCredentials: true,
      })
      .pipe(take(1));
  }
}
