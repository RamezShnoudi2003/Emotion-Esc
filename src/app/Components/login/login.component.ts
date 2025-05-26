import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputComponent } from '../../UIComponents/input/input.component';
import { ButtonComponent } from '../../UIComponents/button/button.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AccountService } from '../../Services/API/account.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../Services/language.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SweetAlertService } from '../../Services/sweet-alert.service';
import { TabService } from '../../Services/tab.service';
import { SongsService } from '../../Services/API/songs.service';
import { NgIf } from '@angular/common';
import { SpotifyService } from '../../Services/spotify.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    InputComponent,
    ButtonComponent,
    ReactiveFormsModule,
    TranslateModule,
    RouterLink,
    NgIf,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginFormGroup!: FormGroup<any>;
  isLoginBtnLoading: boolean = false;
  isLoginBtnDisabled: boolean = true;

  emailFormGroup!: FormGroup<any>;
  isEmailEntered: boolean = false;
  isEmailBtnDisabled: boolean = true;
  isEmailBtnLoading: boolean = false;

  isForgotPassClicked: boolean = false;

  resetPasswordFormGroup!: FormGroup<any>;
  isResetBtnDisabled: boolean = true;
  isResetBtnLoading: boolean = false;

  resetToken: string = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly tabService: TabService,
    private readonly accountService: AccountService,
    private readonly sweetAlertService: SweetAlertService,
    private readonly spotifyService: SpotifyService
  ) {}

  ngOnDestroy(): void {
    document.body.classList.remove('login-page-body');
  }

  ngOnInit(): void {
    document.body.classList.add('login-page-body');

    this.intializeForm();

    this.loginFormGroup.valueChanges.subscribe(() => {
      // Disable button if the form is invalid
      this.isLoginBtnDisabled = this.loginFormGroup.invalid;
    });

    this.emailFormGroup.valueChanges.subscribe({
      next: () => {
        this.isEmailBtnDisabled = this.emailFormGroup.invalid;
      },
    });

    this.resetPasswordFormGroup.valueChanges.subscribe({
      next: () => {
        this.isResetBtnDisabled = this.resetPasswordFormGroup.invalid;
      },
    });
  }

  intializeForm() {
    this.loginFormGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.emailFormGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetPasswordFormGroup = this.formBuilder.group({
      code: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  login() {
    this.isLoginBtnLoading = true;

    let formValues = this.loginFormGroup.value;

    console.log('login form values ', formValues);

    this.accountService.login(formValues).subscribe({
      next: (response: any) => {
        console.log('login method in accoint service', response);
        let user = response.data.user;
        let token = response.token;

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', JSON.stringify(token));
        this.accountService.updateLoginSubject(true);

        this.spotifyService.setIsLinkedToSpotify(user.linkToSpotify);

        this.router.navigateByUrl('/home');
        // this.tabService.setSelectedTab('home');

        this.isLoginBtnLoading = false;
      },
      error: (serverError) => {
        this.isLoginBtnLoading = false;
      },
    });
  }

  forgotPass() {
    this.isForgotPassClicked = !this.isForgotPassClicked;
  }

  enterEmail() {
    this.isEmailBtnLoading = true;
    let email = this.emailFormGroup.value['email'];

    this.accountService.sendOtpToEmail(email).subscribe({
      next: (response: any) => {
        this.sweetAlertService.success(response.data.message);
        if (response.data.message) {
          this.isEmailBtnLoading = false;
          this.isEmailEntered = true;
          this.resetToken = response.data.resetToken;

          this.isEmailBtnLoading = false;
          this.isEmailEntered = true;
        }
        console.log(response);
      },
      error: (serverError) => {
        this.isEmailBtnLoading = false;
      },
    });
  }

  preventSubmission(event: Event) {
    event.preventDefault();
  }

  resetForgottenPassword() {
    this.isResetBtnLoading = true;
    let model = {
      code: this.resetPasswordFormGroup.value['code'],
      password: this.resetPasswordFormGroup.value['newPassword'],
      confirmPassword: this.resetPasswordFormGroup.value['confirmPassword'],
    };

    this.accountService
      .resetForgottenPassword(model, this.resetToken)
      .subscribe({
        next: (response: any) => {
          this.isResetBtnLoading = false;
          let user = response.data.user;
          let token = response.token;

          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', JSON.stringify(token));
          this.accountService.updateLoginSubject(true);

          this.router.navigateByUrl('/home');
          this.tabService.setSelectedTab('home');
          this.spotifyService.setIsLinkedToSpotify(user.linkToSpotify);

          this.sweetAlertService.success(response.data.message);
          console.log(response);
        },
        error: (serverSerror) => {
          this.isResetBtnLoading = false;
        },
      });
  }

  backtoOnBoarding() {
    this.router.navigateByUrl('on-boarding');
  }

  backtoLogin() {
    this.isForgotPassClicked = false;
    this.isEmailEntered = false;
    this.emailFormGroup.reset();
    this.resetPasswordFormGroup.reset();
  }
}
