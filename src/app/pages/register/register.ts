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
    console.log('submit appelé');
    console.log('valid', this.form.valid);
    console.log('form errors', this.form.errors);
    console.log('value', this.form.getRawValue());

    Object.entries(this.form.controls).forEach(([name, control]) => {
      console.log(name, control.value, control.valid, control.errors);
    });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.log('bloqué car invalide');
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    console.log('appel API');
    this.authService.register(this.form.getRawValue()).subscribe({
      next: (res) => {
        console.log('OK', res);
        this.loading = false;
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        console.error('ERR', err);
        this.loading = false;
        this.errorMessage = this.authService.getErrorMessage(err);
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
