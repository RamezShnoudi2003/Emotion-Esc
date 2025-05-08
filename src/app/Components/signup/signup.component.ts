import { AccountService } from '../../Services/API/account.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputComponent } from '../../UIComponents/input/input.component';
import { ButtonComponent } from '../../UIComponents/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../Services/language.service';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { SweetAlertService } from '../../Services/sweet-alert.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    InputComponent,
    TranslateModule,
    ButtonComponent,
    RouterLink,
    ReactiveFormsModule,
    NgIf,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit, OnDestroy {
  signupFormGroup!: FormGroup<any>;

  otpFormGroup!: FormGroup<any>;

  lang: string = localStorage.getItem('language') || 'en';

  isResendBtnDisabled: boolean = true;

  isSignedUp: boolean = false;

  isSignUpBtnDisabled: boolean = true;
  isSignupBtnLoading: boolean = false;

  isCodeEntered: boolean = false;

  isVerificationBtnDisabled: boolean = true;
  isVerificationBtnLoading: boolean = false;

  count: number = 0;
  timer: any;

  constructor(
    private readonly accountService: AccountService,
    private readonly formBuilder: FormBuilder,
    private readonly languageService: LanguageService,
    private readonly router: Router,
    private readonly swal: SweetAlertService
  ) {}

  ngOnDestroy(): void {
    document.body.classList.remove('signup-page-body');
    clearInterval(this.timer);
  }

  ngOnInit(): void {
    document.body.classList.add('signup-page-body');

    this.intializeForm();

    this.signupFormGroup.valueChanges.subscribe(() => {
      this.isSignUpBtnDisabled = this.signupFormGroup.invalid;
    });

    this.otpFormGroup.valueChanges.subscribe(() => {
      this.isVerificationBtnDisabled = this.otpFormGroup.invalid;
    });
  }

  intializeForm() {
    this.signupFormGroup = this.formBuilder.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.otpFormGroup = this.formBuilder.group({
      otp: [
        '',
        [Validators.required, Validators.maxLength(6), Validators.minLength(6)],
      ],
    });
  }

  startSignup() {
    this.isSignupBtnLoading = true;

    let formValues = this.signupFormGroup.value;

    console.log('signup form values ', formValues);

    this.accountService.startSignup(formValues).subscribe({
      next: (response: any) => {
        console.log('signup response ', response);
        this.swal.success('Enter Otp sent to your email ');

        this.isSignedUp = true;

        this.isSignupBtnLoading = false;

        this.sendOtpTimer();
      },
      error: (serverError) => {
        this.isSignupBtnLoading = false;
        this.isSignedUp = false;
      },
    });
  }

  enterOTP() {
    this.isVerificationBtnLoading = true;

    let formValues = this.otpFormGroup.value;

    let model = {
      email: this.signupFormGroup.value.email,
      code: this.otpFormGroup.value.otp,
    };

    console.log('otp form ', formValues);
    console.log('otp model ', model);

    this.accountService.verifySignup(model).subscribe({
      next: (response: any) => {
        console.log('otpp response  ', response);

        console.log(response);
        let user = response.data.user;
        let token = response.token;

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', JSON.stringify(token));
        this.accountService.updateLoginSubject(true);

        this.router.navigateByUrl('/home');

        this.isCodeEntered = true;

        this.isVerificationBtnLoading = false;
      },
      error: (serverError) => {
        this.isCodeEntered = true;
        this.isVerificationBtnLoading = false;
      },
    });
  }

  resendOTP() {
    let email = this.signupFormGroup.value.email;
    this.accountService.resendSignup(email).subscribe({
      next: (response: any) => {
        this.swal.success('Enter Otp sent to your email ');
        console.log('resend otp response ', response);
      },
    });
  }

  sendOtpTimer() {
    this.count = 60;
    this.isResendBtnDisabled = true;
    this.timer = setInterval(() => {
      this.count -= 1;
      this.isResendBtnDisabled = true;
      if (this.count == 0) {
        this.isResendBtnDisabled = false;
        clearInterval(this.timer);
      }
    }, 2000);
  }

  backToSignup() {
    this.isSignedUp = false;
    this.isCodeEntered = false;
  }
}
