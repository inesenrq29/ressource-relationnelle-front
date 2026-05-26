import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  CategoryDto,
  CreateResourceRequest,
  ResourceService,
  ResourceType,
} from '../../core/services/resource.service';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './resources.html',
  styleUrl: './resources.css',
})
export class ResourcesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly resourceService = inject(ResourceService);

  categories: CategoryDto[] = [];

  loading = false;
  errorMessage = '';
  successMessage = '';

  readonly resourceTypes: { value: ResourceType; label: string }[] = [
    { value: 'ARTICLE', label: 'Article' },
    { value: 'VIDEO', label: 'Vidéo' },
    { value: 'PDF', label: 'PDF' },
    { value: 'GAME', label: 'Jeu' },
    { value: 'ACTIVITY_GAME', label: 'Activité / Jeu' },
  ];

  form = this.fb.nonNullable.group({
    categoryId: ['', Validators.required],
    resourceType: ['', Validators.required],
    resourceTitle: ['', [Validators.required, Validators.maxLength(255)]],
    resourceDescription: [''],
    tagsRaw: [''],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Merci de remplir les champs obligatoires.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const value = this.form.getRawValue();

    const payload: CreateResourceRequest = {
      categoryId: value.categoryId,
      resourceType: value.resourceType as ResourceType,
      resourceTitle: value.resourceTitle,
      resourceDescription: value.resourceDescription,
      tags: this.parseTags(value.tagsRaw),
      status: 'DRAFT',
    };

    this.resourceService.createResource(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Ressource créée en brouillon.';
        this.form.reset({
          categoryId: '',
          resourceType: '',
          resourceTitle: '',
          resourceDescription: '',
          tagsRaw: '',
        });
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message || 'Impossible de créer la ressource.';
      },
    });
  }

  private loadCategories(): void {
    this.resourceService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les catégories.';
      },
    });
  }

  private parseTags(tagsRaw: string): string[] {
    return tagsRaw
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  get categoryId() {
    return this.form.controls.categoryId;
  }

  get resourceType() {
    return this.form.controls.resourceType;
  }

  get resourceTitle() {
    return this.form.controls.resourceTitle;
  }
}
