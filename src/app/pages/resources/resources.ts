import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  CategoryDto,
  CreateResourceRequest,
  ResourceDto,
  ResourceService
} from '../../core/services/resource.service';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './resources.html',
  styleUrl: './resources.css'
})
export class ResourcesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly resourceService = inject(ResourceService);

  loading = false;
  submitLoading = false;
  errorMessage = '';
  successMessage = '';

  categories: CategoryDto[] = [];
  resources: ResourceDto[] = [];

  readonly resourceTypes = [
    { value: 'ARTICLE', label: 'Article' },
    { value: 'VIDEO', label: 'Vidéo' },
    { value: 'PDF', label: 'PDF' },
    { value: 'GAME', label: 'Jeu' },
    { value: 'ACTIVITY_GAME', label: 'Activité / Jeu' },
    { value: 'READING_SHEET', label: 'Fiche de lecture' },
    { value: 'CHALLENGE_CARD', label: 'Carte défi' },
    { value: 'EXERCISE_WORKSHOP', label: 'Exercice / Atelier' }
  ] as const;

  form = this.fb.nonNullable.group({
    resourceTitle: ['', [Validators.required, Validators.maxLength(255)]],
    resourceDescription: ['', [Validators.maxLength(5000)]],
    categoryId: ['', [Validators.required]],
    resourceType: ['', [Validators.required]],
    tagsRaw: ['']
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadResources();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const raw = this.form.getRawValue();

    const payload: CreateResourceRequest = {
      resourceTitle: raw.resourceTitle,
      resourceDescription: raw.resourceDescription,
      status: 'DRAFT',
      categoryId: raw.categoryId,
      resourceType: raw.resourceType as CreateResourceRequest['resourceType'],
      tags: this.parseTags(raw.tagsRaw)
    };

    this.resourceService.createResource(payload).subscribe({
      next: (created) => {
        this.resources.unshift(created);
        this.submitLoading = false;
        this.successMessage = 'Ressource ajoutée avec succès.';

        this.form.reset({
          resourceTitle: '',
          resourceDescription: '',
          categoryId: '',
          resourceType: '',
          tagsRaw: ''
        });
      },
      error: (error) => {
        this.submitLoading = false;
        this.errorMessage =
          error?.error?.message ||
          'Impossible de créer la ressource pour le moment.';
      }
    });
  }

  private loadCategories(): void {
    this.loading = true;

    this.resourceService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger les catégories.';
      }
    });
  }

  private loadResources(): void {
    this.resourceService.getResources().subscribe({
      next: (resources) => {
        this.resources = resources;
      },
      error: () => {
      }
    });
  }

  private parseTags(tagsRaw: string): string[] {
    return tagsRaw
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  get resourceTitle() {
    return this.form.controls.resourceTitle;
  }

  get categoryId() {
    return this.form.controls.categoryId;
  }

  get resourceType() {
    return this.form.controls.resourceType;
  }
}
