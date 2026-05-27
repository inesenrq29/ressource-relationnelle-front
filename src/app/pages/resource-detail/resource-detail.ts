import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
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

  loading = signal(true);
  errorMessage = signal('');
  resource = signal<ResourceDto | null>(null);

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
      this.loading.set(false);
      this.errorMessage.set('Identifiant de ressource introuvable.');
      return;
    }

    this.loadResource(resourceId);
  }

  getResourceTypeLabel(type: ResourceType | string | null | undefined): string {
    if (!type) return 'Type non renseigné';
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

  private loadResource(resourceId: string): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.resource.set(null);

    this.resourceService
      .getResources()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (resources) => {
          const found = resources.find((r) => r.resourceId === resourceId);
          if (!found) {
            this.errorMessage.set('Cette ressource est introuvable.');
            return;
          }
          this.resource.set({ ...found, tags: found.tags ?? [] });
        },
        error: () => {
          this.errorMessage.set('Impossible de charger cette ressource.');
        },
      });
  }
}
