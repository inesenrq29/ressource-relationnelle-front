import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { CategoryDto, ResourceService, ResourceType } from '../../core/services/resource.service';
import { StatService, StatsDashboardDto, StatsFilterDto } from '../../core/services/stat.service';

type TypeFilter = ResourceType | 'ALL';

interface ResourceTypeOption {
  value: ResourceType;
  label: string;
}

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './admin-stats.html',
  styleUrl: './admin-stats.css',
})
export class AdminStatsComponent implements OnInit {
  private readonly statService = inject(StatService);
  private readonly resourceService = inject(ResourceService);

  loading = signal(true);
  errorMessage = signal('');
  stats = signal<StatsDashboardDto | null>(null);

  categories = signal<CategoryDto[]>([]);
  selectedCategoryId = signal<string>('ALL');
  selectedResourceType = signal<TypeFilter>('ALL');
  startDate = signal('');
  endDate = signal('');

  filterLoading = signal(false);
  exportLoading = signal(false);

  readonly resourceTypeOptions: ResourceTypeOption[] = [
    { value: 'ARTICLE', label: 'Article' },
    { value: 'VIDEO', label: 'Vidéo' },
    { value: 'PDF', label: 'PDF' },
    { value: 'GAME', label: 'Jeu' },
    { value: 'ACTIVITY_GAME', label: 'Activité / Jeu' },
    { value: 'READING_SHEET', label: 'Fiche de lecture' },
    { value: 'CHALLENGE_CARD', label: 'Carte défi' },
    { value: 'EXERCISE_WORKSHOP', label: 'Exercice / Atelier' },
  ];

  readonly resourceTypeLabels: Partial<Record<string, string>> = this.resourceTypeOptions.reduce<
    Partial<Record<string, string>>
  >((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});

  readonly hasActiveFilters = computed(
    () =>
      this.selectedCategoryId() !== 'ALL' ||
      this.selectedResourceType() !== 'ALL' ||
      !!this.startDate() ||
      !!this.endDate(),
  );

  readonly activeFiltersLabel = computed(() => {
    if (!this.hasActiveFilters()) {
      return 'Aucun filtre actif';
    }

    const filters: string[] = [];

    if (this.selectedCategoryId() !== 'ALL') {
      const category = this.categories().find(
        (item) => item.categoryId === this.selectedCategoryId(),
      );

      filters.push(`Catégorie : ${category?.name ?? 'sélectionnée'}`);
    }

    if (this.selectedResourceType() !== 'ALL') {
      filters.push(`Type : ${this.resourceTypeLabels[this.selectedResourceType()]}`);
    }

    if (this.startDate()) {
      filters.push(`Depuis : ${this.formatDateFr(this.startDate())}`);
    }

    if (this.endDate()) {
      filters.push(`Jusqu’au : ${this.formatDateFr(this.endDate())}`);
    }

    return filters.join(' · ');
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadStats();
  }

  applyFilters(): void {
    this.filterLoading.set(true);
    this.errorMessage.set('');

    this.statService
      .getFilteredStats(this.buildFilterPayload())
      .pipe(finalize(() => this.filterLoading.set(false)))
      .subscribe({
        next: (stats) => {
          this.stats.set(stats);
        },
        error: () => {
          this.errorMessage.set('Impossible de filtrer les statistiques.');
        },
      });
  }

  resetFilters(): void {
    this.selectedCategoryId.set('ALL');
    this.selectedResourceType.set('ALL');
    this.startDate.set('');
    this.endDate.set('');
    this.loadStats();
  }

  exportCsv(): void {
    if (this.exportLoading()) return;

    this.exportLoading.set(true);

    this.statService
      .exportStats(this.buildFilterPayload())
      .pipe(finalize(() => this.exportLoading.set(false)))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');

          link.href = url;
          link.download = this.hasActiveFilters() ? 'stats-filtrees.csv' : 'stats.csv';
          link.click();

          URL.revokeObjectURL(url);
        },
        error: () => {
          this.errorMessage.set('Impossible d’exporter les statistiques.');
        },
      });
  }

  entries(obj: Record<string, number> | null | undefined): [string, number][] {
    if (!obj) return [];

    return Object.entries(obj).sort((a, b) => b[1] - a[1]);
  }

  getTypeLabel(type: string): string {
    return this.resourceTypeLabels[type] ?? type;
  }

  private loadStats(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.statService
      .getStats()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (stats) => {
          this.stats.set(stats);
        },
        error: () => {
          this.errorMessage.set('Impossible de charger les statistiques.');
        },
      });
  }

  private loadCategories(): void {
    this.resourceService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: () => {
        this.categories.set([]);
      },
    });
  }

  private buildFilterPayload(): StatsFilterDto {
    const selectedType = this.selectedResourceType();
    const selectedCategory = this.selectedCategoryId();

    const resourceType: ResourceType | null = selectedType === 'ALL' ? null : selectedType;
    const categoryId: string | null = selectedCategory === 'ALL' ? null : selectedCategory;

    return {
      resourceType,
      categoryId,
      startDate: this.startDate() ? `${this.startDate()}T00:00:00Z` : null,
      endDate: this.endDate() ? `${this.endDate()}T23:59:59Z` : null,
    };
  }

  private formatDateFr(value: string): string {
    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('fr-FR');
  }
}
