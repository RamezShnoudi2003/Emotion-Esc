import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PersistDataService {
  private readonly emotionSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  emotion$: Observable<string> = this.emotionSubject.asObservable();

  obj: any = {};

  setItem(key: string, value: any) {
    this.obj[key] = value;
  }

  getItem(key: string) {
    return this.obj[key];
  }

  removeItem(key: string) {
    delete this.obj[key];
  }

  clearData() {
    this.obj = {};
  }

  updateEmotion(emotion: string) {
    localStorage.setItem('emotion', emotion);
    this.emotionSubject.next(emotion);
  }

  restoreEmotion() {
    let emotion = localStorage.getItem('emotion') || '';
    if (emotion) {
      this.emotionSubject.next(emotion);
    }
  }
}
