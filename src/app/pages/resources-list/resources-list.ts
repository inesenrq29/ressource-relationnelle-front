import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  CategoryDto,
  ResourceDto,
  ResourceService,
  ResourceType,
} from '../../core/services/resource.service';

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
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './resources-list.html',
  styleUrl: './resources-list.css',
})
export class ResourcesListComponent implements OnInit {
  private readonly resourceService = inject(ResourceService);

  loading = true;
  errorMessage = '';

  search = signal('');
  selectedCategoryId = signal('');
  selectedType = signal('');
  sortDirection = signal<'newest' | 'oldest' | 'title'>('newest');

  categories: CategoryDto[] = [];
  resources = signal<ResourceDto[]>([]);

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

  filteredResources = computed(() => {
    const searchValue = this.search().trim().toLowerCase();
    const categoryId = this.selectedCategoryId();
    const type = this.selectedType();
    const sort = this.sortDirection();

    let result = this.resources().filter((resource) => {
      const matchesSearch =
        !searchValue ||
        resource.resourceTitle.toLowerCase().includes(searchValue) ||
        resource.resourceDescription?.toLowerCase().includes(searchValue) ||
        resource.categoryName?.toLowerCase().includes(searchValue) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(searchValue));

      const matchesCategory = !categoryId || resource.categoryId === categoryId;
      const matchesType = !type || resource.resourceType === type;

      return matchesSearch && matchesCategory && matchesType;
    });

    result = [...result].sort((a, b) => {
      if (sort === 'title') {
        return a.resourceTitle.localeCompare(b.resourceTitle);
      }

      const dateA = new Date(a.resourceCreatedAt).getTime();
      const dateB = new Date(b.resourceCreatedAt).getTime();

      return sort === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadResources();
  }

  updateSearch(value: string): void {
    this.search.set(value);
  }

  updateCategory(value: string): void {
    this.selectedCategoryId.set(value);
  }

  updateType(value: string): void {
    this.selectedType.set(value);
  }

  updateSort(value: 'newest' | 'oldest' | 'title'): void {
    this.sortDirection.set(value);
  }

  resetFilters(): void {
    this.search.set('');
    this.selectedCategoryId.set('');
    this.selectedType.set('');
    this.sortDirection.set('newest');
  }

  getResourceTypeLabel(type: ResourceType): string {
    return this.resourceTypes.find((item) => item.value === type)?.label ?? type;
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

  private loadResources(): void {
    this.loading = true;
    this.errorMessage = '';

    this.resourceService.getResources().subscribe({
      next: (resources) => {
        this.resources.set(resources);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les ressources.';
        this.loading = false;
      },
    });
  }
}
