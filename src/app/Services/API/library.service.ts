import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private readonly baseUrl = environment.apiUrl + 'library/';

  private readonly addedRemovedSongFromLibraryTriggerSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  addedRemovedSongFromLibraryTrigger$: Observable<boolean> =
    this.addedRemovedSongFromLibraryTriggerSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  getLibrary(model: any) {
    return this.http
      .get(
        `${this.baseUrl}get-library?type=${model.type}&search=${model.search}`
      )
      .pipe(take(1));
  }

  addItemToLibrary(model: any) {
    return this.http.post(`${this.baseUrl}add-to-library`, model).pipe(take(1));
  }

  removeItemFromLibrary(id: string) {
    return this.http
      .delete(`${this.baseUrl}remove-from-library/${id}`)
      .pipe(take(1));
  }

  updateaddedRemovedSongFromLibraryTrigger(value: boolean) {
    this.addedRemovedSongFromLibraryTriggerSubject.next(value);
  }
}
