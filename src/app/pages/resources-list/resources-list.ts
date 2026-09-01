import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  CategoryDto,
  ResourceDto,
  ResourceService,
  ResourceStatus,
  ResourceType,
} from '../../core/services/resource.service';
import { SessionService } from '../../core/services/session.service';

type CategoryFilter = string | 'ALL';
type TypeFilter = ResourceType | 'ALL';
type ResourceSort = 'NEWEST' | 'OLDEST' | 'TITLE_ASC' | 'TITLE_DESC';

interface SelectOption<T> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-resources-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './resources-list.html',
  styleUrl: './resources-list.css',
})
export class ResourcesListComponent implements OnInit {
  protected readonly session = inject(SessionService);

  private readonly resourceService = inject(ResourceService);

  resources: ResourceDto[] = [];
  categories: CategoryDto[] = [];

  loading = false;
  errorMessage = '';

  search = '';
  selectedCategoryId: CategoryFilter = 'ALL';
  selectedType: TypeFilter = 'ALL';
  selectedSort: ResourceSort = 'NEWEST';

  readonly typeOptions: SelectOption<ResourceType>[] = [
    { value: 'ARTICLE', label: 'Article' },
    { value: 'VIDEO', label: 'Vidéo' },
    { value: 'PDF', label: 'PDF' },
    { value: 'GAME', label: 'Jeu' },
    { value: 'ACTIVITY_GAME', label: 'Activité / Jeu' },
    { value: 'READING_SHEET', label: 'Fiche de lecture' },
    { value: 'CHALLENGE_CARD', label: 'Carte défi' },
    { value: 'EXERCISE_WORKSHOP', label: 'Exercice / Atelier' },
  ];

  readonly sortOptions: SelectOption<ResourceSort>[] = [
    { value: 'NEWEST', label: 'Plus récentes' },
    { value: 'OLDEST', label: 'Plus anciennes' },
    { value: 'TITLE_ASC', label: 'Titre A → Z' },
    { value: 'TITLE_DESC', label: 'Titre Z → A' },
  ];

  ngOnInit(): void {
    this.loadCategories();
    this.loadResources();
  }

  get filteredResources(): ResourceDto[] {
    const searchValue = this.search.trim().toLowerCase();

    const filtered = this.resources
      .filter((resource) => resource.status === 'PUBLISHED' && resource.resourceIsActive)
      .filter((resource) => {
        const title = (resource.resourceTitle ?? '').toLowerCase();
        const description = (resource.resourceDescription ?? '').toLowerCase();
        const categoryName = (resource.categoryName ?? '').toLowerCase();
        const typeLabel = this.getTypeLabel(resource.resourceType).toLowerCase();
        const tags = resource.tags ?? [];

        const matchesSearch =
          !searchValue ||
          title.includes(searchValue) ||
          description.includes(searchValue) ||
          categoryName.includes(searchValue) ||
          typeLabel.includes(searchValue) ||
          tags.some((tag) => tag.toLowerCase().includes(searchValue));

        const matchesCategory =
          this.selectedCategoryId === 'ALL' || resource.categoryId === this.selectedCategoryId;

        const matchesType =
          this.selectedType === 'ALL' || resource.resourceType === this.selectedType;

        return matchesSearch && matchesCategory && matchesType;
      });

    return this.sortFilteredResources(filtered);
  }

  get resultCountLabel(): string {
    const count = this.filteredResources.length;

    if (count === 0) {
      return 'Aucune ressource publiée trouvée';
    }

    if (count === 1) {
      return '1 ressource publiée trouvée';
    }

    return `${count} ressources publiées trouvées`;
  }

  resetFilters(): void {
    this.search = '';
    this.selectedCategoryId = 'ALL';
    this.selectedType = 'ALL';
    this.selectedSort = 'NEWEST';
  }

  reload(): void {
    this.loadResources();
  }

  getTypeLabel(type: ResourceType): string {
    return this.typeOptions.find((option) => option.value === type)?.label ?? type;
  }

  getStatusLabel(status: ResourceStatus): string {
    const labels: Record<ResourceStatus, string> = {
      DRAFT: 'Brouillon',
      PENDING_VALIDATION: 'En validation',
      PUBLISHED: 'Publié',
      ARCHIVED: 'Archivé',
      RESTRICTED: 'Restreint',
    };

    return labels[status] ?? status;
  }

  getStatusClass(status: ResourceStatus): string {
    return `resource-card__status--${status.toLowerCase().replace('_', '-')}`;
  }

  private loadResources(): void {
    this.loading = true;
    this.errorMessage = '';

    this.resourceService
      .getResources()
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: (resources) => {
          this.resources = resources.map((resource) => ({
            ...resource,
            tags: resource.tags ?? [],
          }));
        },
        error: () => {
          this.errorMessage = 'Impossible de charger les ressources.';
        },
      });
  }

  private loadCategories(): void {
    this.resourceService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: () => {
        this.categories = [];
      },
    });
  }

  private sortFilteredResources(resources: ResourceDto[]): ResourceDto[] {
    return [...resources].sort((first, second) => {
      switch (this.selectedSort) {
        case 'OLDEST':
          return this.getResourceDate(first) - this.getResourceDate(second);

        case 'TITLE_ASC':
          return first.resourceTitle.localeCompare(second.resourceTitle, 'fr', {
            sensitivity: 'base',
          });

        case 'TITLE_DESC':
          return second.resourceTitle.localeCompare(first.resourceTitle, 'fr', {
            sensitivity: 'base',
          });

        case 'NEWEST':
        default:
          return this.getResourceDate(second) - this.getResourceDate(first);
      }
    });
  }

  private getResourceDate(resource: ResourceDto): number {
    const timestamp = new Date(resource.resourceCreatedAt).getTime();

    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}
