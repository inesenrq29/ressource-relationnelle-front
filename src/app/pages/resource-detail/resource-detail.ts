import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import {
  ResourceDto,
  ResourceService,
  ResourceType,
} from '../../core/services/resource.service';

@Component({
  selector: 'app-resource-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule],
  templateUrl: './resource-detail.html',
  styleUrl: './resource-detail.css',
})
export class ResourceDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly resourceService = inject(ResourceService);

  loading = true;
  errorMessage = '';
  resource: ResourceDto | null = null;

  readonly resourceTypeLabels: Record<string, string> = {
    ARTICLE: 'Article',
    VIDEO: 'Vidéo',
    PDF: 'PDF',
    GAME: 'Jeu',
    ACTIVITY_GAME: 'Activité / Jeu',
    READING_SHEET: 'Fiche de lecture',
    CHALLENGE_CARD: 'Carte défi',
    EXERCISE_WORKSHOP: 'Exercice / Atelier',
  };

  ngOnInit(): void {
    const resourceId = this.route.snapshot.paramMap.get('resourceId');

    if (!resourceId) {
      this.loading = false;
      this.errorMessage = 'Identifiant de ressource introuvable.';
      return;
    }

    this.loadResourceFromCatalog(resourceId);
  }

  getResourceTypeLabel(type: ResourceType | string | null | undefined): string {
    if (!type) {
      return 'Type non renseigné';
    }

    return this.resourceTypeLabels[type] ?? type;
  }

  getStatusLabel(status: string | null | undefined): string {
    const labels: Record<string, string> = {
      DRAFT: 'Brouillon',
      PENDING_VALIDATION: 'En attente de validation',
      PUBLISHED: 'Publié',
      RESTRICTED: 'Restreint',
      ARCHIVED: 'Archivé',
    };

    return status ? labels[status] ?? status : 'Statut inconnu';
  }

  private loadResourceFromCatalog(resourceId: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.resource = null;

    this.resourceService
      .getResources()
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: (resources) => {
          const foundResource = resources.find(
            (resource) => resource.resourceId === resourceId,
          );

          if (!foundResource) {
            this.errorMessage = 'Cette ressource est introuvable.';
            return;
          }

          this.errorMessage = '';
          this.resource = {
            ...foundResource,
            tags: foundResource.tags ?? [],
          };
        },
        error: (error) => {
          console.error('[ResourceDetail] erreur =', error);

          if (error?.status === 401 || error?.status === 403) {
            this.errorMessage =
              'Tu n’as pas les droits pour consulter cette ressource.';
            return;
          }

          this.errorMessage = 'Impossible de charger cette ressource.';
        },
      });
  }
}
