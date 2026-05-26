import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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

  readonly resourceTypeLabels: Record<ResourceType, string> = {
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
      this.errorMessage = 'Ressource introuvable.';
      this.loading = false;
      return;
    }

    this.resourceService.getResourceById(resourceId).subscribe({
      next: (resource) => {
        this.resource = resource;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger cette ressource.';
        this.loading = false;
      },
    });
  }

  getResourceTypeLabel(type: ResourceType): string {
    return this.resourceTypeLabels[type] ?? type;
  }
}
