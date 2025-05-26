import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, model } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, of, take } from 'rxjs';
import { PersistDataService } from '../persist-data.service';
import { environment } from '../../../environments/environment';

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

  startSignup(model: any) {
    return this.http.post(this.baseUrl + 'signup/start', model).pipe(take(1));
  }

  verifySignup(model: any) {
    return this.http.post(this.baseUrl + 'signup/verify', model).pipe(take(1));
  }

  resendSignup(email: string) {
    return this.http
      .get(this.baseUrl + `signup/resend?email=${email}`)
      .pipe(take(1));
  }

  sendOtpToEmail(email: string) {
    return this.http
      .post(this.baseUrl + `forget-password`, { email })
      .pipe(take(1));
  }

  login(model: any): Observable<any> {
    return this.http.post(`${this.baseUrl}login`, model).pipe(take(1));
  }

  logout() {
    localStorage.clear();
    this.isLoggedInSubject.next(false);
    this.persistDataService.clearData();
    this.router.navigateByUrl('on-boarding');
  }

  updateProfile(model: any) {
    return this.http.post(`${this.baseUrl}edit-profile`, model).pipe(take(1));
  }

  updatePassword(model: any) {
    return this.http
      .patch(this.baseUrl + `update-my-password`, model)
      .pipe(take(1));
  }

  resetForgottenPassword(model: any, resetToken: string) {
    return this.http
      .patch(this.baseUrl + `reset-password/${resetToken}`, model)
      .pipe(take(1));
  }

  loginToSpotify() {
    return this.http.get(`${this.baseUrl}login-spotify`).pipe(take(1));
  }

  linkToSpotify(model: any) {
    return this.http
      .get(
        `${this.baseUrl}link-spotify?code=${model.code}&state=${model.state}`
      )
      .pipe(take(1));
  }

  refreshSpotifyToken(refreshToken: string) {
    return this.http
      .post(`${this.baseUrl}refresh-spotify-token`, { refreshToken })
      .pipe(take(1));
  }

  updateLoginSubject(loggedIn: boolean) {
    this.isLoggedInSubject.next(loggedIn);
  }

  isUserLoggedIn(): Observable<boolean> {
    // Only update the state if it's changed, to avoid unnecessary emissions
    const isLoggedIn = this.checkLoginStatus();
    if (this.isLoggedInSubject.value !== isLoggedIn) {
      this.isLoggedInSubject.next(isLoggedIn);
    }
    return this.isLoggedIn$;
  }

  private checkLoginStatus(): boolean {
    const user = localStorage.getItem('user');
    return !!user;
  }
}
