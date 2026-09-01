import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  CategoryDto,
  ResourceService,
  ResourceType,
  UpdateResourceRequest,
} from '../../core/services/resource.service';

@Component({
  selector: 'app-resource-edit',
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
  templateUrl: './resource-edit.html',
  styleUrl: './resource-edit.css',
})
export class ResourceEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly resourceService = inject(ResourceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  resourceId = '';
  categories = signal<CategoryDto[]>([]);
  loading = signal(true);
  saving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  readonly resourceTypes: { value: ResourceType; label: string }[] = [
    { value: 'ARTICLE', label: 'Article' },
    { value: 'VIDEO', label: 'Vidéo' },
    { value: 'PDF', label: 'PDF' },
    { value: 'GAME', label: 'Jeu' },
    { value: 'ACTIVITY_GAME', label: 'Activité / Jeu' },
    { value: 'READING_SHEET', label: 'Fiche de lecture' },
    { value: 'CHALLENGE_CARD', label: 'Carte défi' },
    { value: 'EXERCISE_WORKSHOP', label: 'Exercice / Atelier' },
  ];

  form = this.fb.nonNullable.group({
    categoryId: ['', Validators.required],
    resourceType: ['', Validators.required],
    resourceTitle: ['', [Validators.required, Validators.maxLength(255)]],
    resourceDescription: [''],
    tagsRaw: [''],
  });

  ngOnInit(): void {
    this.resourceId = this.route.snapshot.paramMap.get('resourceId') ?? '';

    if (!this.resourceId) {
      this.loading.set(false);
      this.errorMessage.set('Identifiant de ressource introuvable.');
      return;
    }

    this.loadData();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Merci de remplir les champs obligatoires.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const value = this.form.getRawValue();

    const payload: UpdateResourceRequest = {
      categoryId: value.categoryId,
      resourceType: value.resourceType as ResourceType,
      resourceTitle: value.resourceTitle,
      resourceDescription: value.resourceDescription,
      tags: this.parseTags(value.tagsRaw),
    };

    this.resourceService.updateResource(this.resourceId, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Ressource modifiée avec succès');
        setTimeout(() => {
          this.router.navigate(['/resources', this.resourceId]);
        }, 1500);
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(error?.error?.message || 'Impossible de modifier la ressource.');
      },
    });
  }

  private loadData(): void {
    forkJoin({
      categories: this.resourceService.getCategories(),
      resource: this.resourceService.getResourceById(this.resourceId),
    }).subscribe({
      next: ({ categories, resource }) => {
        this.categories.set(categories);
        this.form.patchValue({
          categoryId: resource.categoryId,
          resourceType: resource.resourceType,
          resourceTitle: resource.resourceTitle,
          resourceDescription: resource.resourceDescription ?? '',
          tagsRaw: (resource.tags ?? []).join(', '),
        });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger les données de la ressource.');
        this.loading.set(false);
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
