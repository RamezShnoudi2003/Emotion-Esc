import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private readonly baseUrl = environment.apiUrl + 'library/';
  constructor(private readonly http: HttpClient) {}

  addItemToLibrary(model: any) {
    return this.http.post(`${this.baseUrl}add-to-library`, model).pipe(take(1));
  }

  getLibrary(model: any) {
    return this.http
      .get(
        `${this.baseUrl}get-library?type=${model.type}&search=${model.search}`
      )
      .pipe(take(1));
  }
  removeItemFromLibrary(id: string) {
    return this.http
      .delete(`${this.baseUrl}remove-from-library/${id}`)
      .pipe(take(1));
  }
}
