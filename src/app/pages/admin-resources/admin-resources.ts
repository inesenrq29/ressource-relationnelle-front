import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ResourceDto, ResourceService, ResourceStatus } from '../../core/services/resource.service';

type StatusFilter = ResourceStatus | 'ALL';

@Component({
  selector: 'app-admin-resources',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './admin-resources.html',
  styleUrl: './admin-resources.css',
})
export class AdminResourcesComponent implements OnInit {
  private readonly resourceService = inject(ResourceService);
  private readonly cdr = inject(ChangeDetectorRef);

  resources: ResourceDto[] = [];

  loading = false;
  actionLoading = false;
  errorMessage = '';
  successMessage = '';

  search = '';
  selectedStatus: StatusFilter = 'ALL';

  readonly statuses: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'Tous les statuts' },
    { value: 'DRAFT', label: 'Brouillon' },
    { value: 'PENDING_VALIDATION', label: 'En attente' },
    { value: 'PUBLISHED', label: 'Publié' },
    { value: 'RESTRICTED', label: 'Restreint' },
    { value: 'ARCHIVED', label: 'Archivé' },
  ];

  ngOnInit(): void {
    this.loadResources();
  }

  get filteredResources(): ResourceDto[] {
    const searchValue = this.search.trim().toLowerCase();

    return this.resources.filter((resource) => {
      const matchesSearch =
        !searchValue ||
        resource.resourceTitle.toLowerCase().includes(searchValue) ||
        resource.resourceDescription?.toLowerCase().includes(searchValue) ||
        resource.categoryName?.toLowerCase().includes(searchValue);

      const matchesStatus =
        this.selectedStatus === 'ALL' || resource.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  submitForValidation(resource: ResourceDto): void {
    this.actionLoading = true;
    this.clearMessages();

    this.resourceService
      .submitResourceForValidation(resource.resourceId)
      .pipe(
        finalize(() => {
          this.actionLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          resource.status = 'PENDING_VALIDATION';
          this.successMessage = 'Ressource soumise à validation.';
        },
        error: () => {
          this.errorMessage = 'Impossible de soumettre cette ressource.';
        },
      });
  }

  publish(resource: ResourceDto): void {
    this.actionLoading = true;
    this.clearMessages();

    this.resourceService
      .validateResource(resource.resourceId)
      .pipe(
        finalize(() => {
          this.actionLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          resource.status = 'PUBLISHED';
          this.successMessage = 'Ressource publiée.';
        },
        error: () => {
          this.errorMessage = 'Impossible de publier cette ressource.';
        },
      });
  }

  restrict(resource: ResourceDto): void {
    this.updateStatus(resource, 'RESTRICTED', 'Ressource restreinte.');
  }

  archive(resource: ResourceDto): void {
    this.updateStatus(resource, 'ARCHIVED', 'Ressource archivée.');
  }

  delete(resource: ResourceDto): void {
    const confirmed = confirm(`Supprimer la ressource "${resource.resourceTitle}" ?`);

    if (!confirmed) {
      return;
    }

    this.actionLoading = true;
    this.clearMessages();

    this.resourceService
      .deleteResource(resource.resourceId)
      .pipe(
        finalize(() => {
          this.actionLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.resources = this.resources.filter((item) => item.resourceId !== resource.resourceId);
          this.successMessage = 'Ressource supprimée.';
        },
        error: () => {
          this.errorMessage = 'Impossible de supprimer cette ressource.';
        },
      });
  }

  getStatusLabel(status: ResourceStatus): string {
    const labels: Record<ResourceStatus, string> = {
      DRAFT: 'Brouillon',
      PENDING_VALIDATION: 'En attente',
      PUBLISHED: 'Publié',
      RESTRICTED: 'Restreint',
      ARCHIVED: 'Archivé',
    };

    return labels[status] ?? status;
  }

  private updateStatus(
    resource: ResourceDto,
    status: ResourceStatus,
    successMessage: string,
  ): void {
    this.actionLoading = true;
    this.clearMessages();

    this.resourceService
      .updateResourceStatus(resource.resourceId, status)
      .pipe(
        finalize(() => {
          this.actionLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          resource.status = status;
          this.successMessage = successMessage;
        },
        error: () => {
          this.errorMessage = 'Impossible de modifier le statut.';
        },
      });
  }

  private loadResources(): void {
    this.loading = true;
    this.clearMessages();

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

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
