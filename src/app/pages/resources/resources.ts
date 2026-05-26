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
  ResourceDto,
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

  currentStep = 1;
  readonly totalSteps = 4;

  loading = false;
  submitLoading = false;
  errorMessage = '';
  successMessage = '';

  categories: CategoryDto[] = [];
  resources: ResourceDto[] = [];

  readonly resourceTypes: { value: ResourceType; label: string; description: string }[] = [
    {
      value: 'ARTICLE',
      label: 'Article',
      description: 'Un contenu écrit pour expliquer, conseiller ou informer.',
    },
    {
      value: 'VIDEO',
      label: 'Vidéo',
      description: 'Une ressource vidéo à regarder seul ou à partager.',
    },
    {
      value: 'PDF',
      label: 'PDF',
      description: 'Un document téléchargeable ou consultable.',
    },
    {
      value: 'GAME',
      label: 'Jeu',
      description: 'Un jeu ou support ludique autour des relations.',
    },
    {
      value: 'ACTIVITY_GAME',
      label: 'Activité / Jeu',
      description: 'Une activité interactive à réaliser seul ou à plusieurs.',
    },
    {
      value: 'READING_SHEET',
      label: 'Fiche de lecture',
      description: 'Une fiche synthétique pour accompagner une lecture.',
    },
    {
      value: 'CHALLENGE_CARD',
      label: 'Carte défi',
      description: 'Un petit défi relationnel simple à réaliser.',
    },
    {
      value: 'EXERCISE_WORKSHOP',
      label: 'Exercice / Atelier',
      description: 'Un exercice guidé ou un atelier de réflexion.',
    },
  ];

  form = this.fb.nonNullable.group({
    categoryId: ['', [Validators.required]],
    resourceType: ['', [Validators.required]],
    resourceTitle: ['', [Validators.required, Validators.maxLength(255)]],
    resourceDescription: ['', [Validators.maxLength(5000)]],
    tagsRaw: [''],
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadResources();
  }

  nextStep(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isCurrentStepValid()) {
      this.markCurrentStepAsTouched();
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step < 1 || step > this.totalSteps) {
      return;
    }

    this.currentStep = step;
  }

  selectResourceType(type: ResourceType): void {
    this.form.controls.resourceType.setValue(type);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Merci de compléter les champs obligatoires.';
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
      tags: this.parseTags(raw.tagsRaw),
    };

    this.resourceService.createResource(payload).subscribe({
      next: (created) => {
        this.resources.unshift(created);
        this.submitLoading = false;
        this.successMessage = 'Ressource créée avec succès en brouillon.';
        this.currentStep = 1;

        this.form.reset({
          categoryId: '',
          resourceType: '',
          resourceTitle: '',
          resourceDescription: '',
          tagsRaw: '',
        });
      },
      error: (error) => {
        this.submitLoading = false;
        this.errorMessage =
          error?.error?.message ||
          'Impossible de créer la ressource pour le moment.';
      },
    });
  }

  getSelectedCategoryName(): string {
    const categoryId = this.form.controls.categoryId.value;

    return (
      this.categories.find((category) => category.categoryId === categoryId)?.name ||
      'Non renseignée'
    );
  }

  getSelectedResourceTypeLabel(): string {
    const type = this.form.controls.resourceType.value;

    return (
      this.resourceTypes.find((item) => item.value === type)?.label ||
      'Non renseigné'
    );
  }

  getParsedTags(): string[] {
    return this.parseTags(this.form.controls.tagsRaw.value);
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
      },
    });
  }

  private loadResources(): void {
    this.resourceService.getResources().subscribe({
      next: (resources) => {
        this.resources = resources;
      },
      error: () => {
        this.resources = [];
      },
    });
  }

  private isCurrentStepValid(): boolean {
    if (this.currentStep === 1) {
      return this.categoryId.valid;
    }

    if (this.currentStep === 2) {
      return this.resourceType.valid;
    }

    if (this.currentStep === 3) {
      return this.resourceTitle.valid && this.resourceDescription.valid;
    }

    return true;
  }

  private markCurrentStepAsTouched(): void {
    if (this.currentStep === 1) {
      this.categoryId.markAsTouched();
    }

    if (this.currentStep === 2) {
      this.resourceType.markAsTouched();
    }

    if (this.currentStep === 3) {
      this.resourceTitle.markAsTouched();
      this.resourceDescription.markAsTouched();
    }
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

  get resourceDescription() {
    return this.form.controls.resourceDescription;
  }
}
