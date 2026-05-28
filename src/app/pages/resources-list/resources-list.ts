import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  CategoryDto,
  ResourceDto,
  ResourceService,
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
  private readonly cdr = inject(ChangeDetectorRef);

  resources: ResourceDto[] = [];
  categories: CategoryDto[] = [];

  loading = false;
  errorMessage = '';

  search = '';
  selectedCategoryId = 'ALL';

  ngOnInit(): void {
    this.loadCategories();
    this.loadResources();
  }

  get filteredResources(): ResourceDto[] {
    const searchValue = this.search.trim().toLowerCase();

    return this.resources.filter((resource) => {
      const matchesSearch =
        !searchValue ||
        resource.resourceTitle.toLowerCase().includes(searchValue) ||
        resource.resourceDescription?.toLowerCase().includes(searchValue) ||
        resource.categoryName?.toLowerCase().includes(searchValue) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(searchValue));

      const matchesCategory =
        this.selectedCategoryId === 'ALL' ||
        resource.categoryId === this.selectedCategoryId;

      return matchesSearch && matchesCategory;
    });
  }

  resetFilters(): void {
    this.search = '';
    this.selectedCategoryId = 'ALL';
  }

  private loadResources(): void {
    this.loading = true;
    this.errorMessage = '';

    this.resourceService
      .getResources()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      },
      error: () => {
        this.categories = [];
      },
    });
  }
}
