import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ResourceService } from '../../core/services/resource.service';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './add-category.html',
  styleUrl: './add-category.css'
})
export class AddCategoryComponent {
  private readonly fb = inject(FormBuilder);
  private readonly resourceService = inject(ResourceService);

  loading = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.resourceService.createCategory(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Catégorie crée avec succès.';
        this.form.reset({ name: '' });
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message || 'Impossible de créer la catégorie.';
      }
    });
  }

  get name() {
    return this.form.controls.name;
  }
}
