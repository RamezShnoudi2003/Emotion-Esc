import { Component, OnInit } from '@angular/core';
import { InputComponent } from '../../UIComponents/input/input.component';
import { ButtonComponent } from '../../UIComponents/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { AccountService } from '../../Services/API/account.service';
import { SweetAlertService } from '../../Services/sweet-alert.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    InputComponent,
    ButtonComponent,
    TranslateModule,
    ReactiveFormsModule,
    NgIf,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  user: any;

  profileFormGroup!: FormGroup<any>;
  passwordFormGroup!: FormGroup<any>;

  isProfileBtnLoading: boolean = false;
  isProfileBtnDisabled: boolean = true;

  isPasswordBtnLoading: boolean = false;
  isPasswordBtnDisabled: boolean = true;

  showResetForm = false;

  firstName: string = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly accountService: AccountService,
    private readonly sweetAlertService: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.user = localStorage.getItem('user') || '{}';
    this.user = JSON.parse(this.user);
    console.log(this.user);

    this.firstName = this.user.fullName.split(' ')[0];

    this.initializeForm();

    this.passwordFormGroup.valueChanges.subscribe({
      next: () => {
        this.isPasswordBtnDisabled = this.passwordFormGroup.invalid;
      },
    });

    this.profileFormGroup.valueChanges.subscribe({
      next: () => {
        this.isProfileBtnDisabled = this.profileFormGroup.invalid;
      },
    });
  }

  initializeForm() {
    this.profileFormGroup = this.fb.group({
      fullName: [this.user.fullName || ''],
      email: [this.user.email || ''],
    });

    this.passwordFormGroup = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  updatePassword() {
    this.isPasswordBtnLoading = true;
    let model = this.passwordFormGroup.value;

    this.accountService.updatePassword(model).subscribe({
      next: (response: any) => {
        console.log('reset passssss', response);
        let token = JSON.stringify(response.token);
        localStorage.setItem('token', token);
        this.sweetAlertService.success(response.data.message);
        this.isPasswordBtnLoading = false;
      },
      error: (serverError) => {
        this.isPasswordBtnLoading = false;
      },
    });
  }

  updateProfile() {
    this.isProfileBtnLoading = true;

    let model = this.profileFormGroup.value;

    this.accountService.updateProfile(model).subscribe({
      next: (response: any) => {
        console.log(response);

        let user = response.data.user;
        user = JSON.stringify(user);
        localStorage.setItem('user', user);
        this.sweetAlertService.success(response.status);
        this.isProfileBtnLoading = false;
      },
      error: (serverError) => {
        this.isProfileBtnLoading = false;
      },
    });
  }

  toggleResetForm() {
    this.showResetForm = !this.showResetForm;
  }
}
