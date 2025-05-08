import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SongPlayService {
  private readonly songSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  songSubject$: Observable<any> = this.songSubject.asObservable();

  setSong(song: any) {
    this.songSubject.next(song);
  }
}
