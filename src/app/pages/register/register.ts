import { CommonModule } from '@angular/common';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

const passwordsMatchValidator: ValidatorFn = (
  formGroup: AbstractControl,
): ValidationErrors | null => {
  const password = formGroup.get('password')?.value;
  const confirmPassword = formGroup.get('confirmPassword')?.value;

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';

  form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
      pseudo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(255)]],
      confirmPassword: [
        '',
        [Validators.required, Validators.minLength(8), Validators.maxLength(255)],
      ],
      areTermsAccepted: [false, [Validators.requiredTrue]],
      isPrivacyPolicyAccepted: [false, [Validators.requiredTrue]],
    },
    {
      validators: passwordsMatchValidator,
    },
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/home');
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.authService.getErrorMessage(error);
      },
    });
  }

  get email() {
    return this.form.controls.email;
  }

  get pseudo() {
    return this.form.controls.pseudo;
  }

  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  get areTermsAccepted() {
    return this.form.controls.areTermsAccepted;
  }

  get isPrivacyPolicyAccepted() {
    return this.form.controls.isPrivacyPolicyAccepted;
  }
}
