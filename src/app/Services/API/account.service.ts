import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, model } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, of, take } from 'rxjs';
import { PersistDataService } from '../persist-data.service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  baseUrl = environment.apiUrl + 'auth/';

  private readonly isLoggedInSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(this.checkLoginStatus());

  public isLoggedIn$: Observable<boolean> =
    this.isLoggedInSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly persistDataService: PersistDataService
  ) {}

  login(model: any): Observable<any> {
    return this.http.post(`${this.baseUrl}login`, model).pipe(take(1));
  }

  startSignup(model: any) {
    return this.http
      .post(this.baseUrl + 'signup/start', model)
      .pipe(map((response) => response));
  }

  verifySignup(model: any) {
    return this.http.post(this.baseUrl + 'signup/verify', model).pipe(take(1));
  }

  resendSignup(email: string) {
    return this.http
      .get(this.baseUrl + `signup/resend?email=${email}`)
      .pipe(map((res) => res));
  }

  private checkLoginStatus(): boolean {
    const user = localStorage.getItem('user');
    return !!user;
  }

  isUserLoggedIn(): Observable<boolean> {
    // Only update the state if it's changed, to avoid unnecessary emissions
    const isLoggedIn = this.checkLoginStatus();
    if (this.isLoggedInSubject.value !== isLoggedIn) {
      this.isLoggedInSubject.next(isLoggedIn);
    }
    return this.isLoggedIn$;
  }

  logout() {
    localStorage.clear();
    this.isLoggedInSubject.next(false);
    this.persistDataService.clearData();
    this.router.navigateByUrl('on-boarding');
  }

  updateLoginSubject(loggedIn: boolean) {
    this.isLoggedInSubject.next(loggedIn);
  }

  updatePassword(model: any) {
    return this.http
      .patch(this.baseUrl + `update-my-password`, model)
      .pipe(take(1));
  }

  updateProfile(model: any) {
    return this.http.post(`${this.baseUrl}edit-profile`, model).pipe(take(1));
  }

  sendOtpToEmail(email: string) {
    return this.http
      .post(this.baseUrl + `forget-password`, { email })
      .pipe(take(1));
  }

  resetForgottenPassword(model: any, resetToken: string) {
    return this.http
      .patch(this.baseUrl + `reset-password/${resetToken}`, model)
      .pipe(take(1));
  }
}
