import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import {
  ProfileResourceKind,
  ProfileResourceLibraryService,
} from '../../core/services/profile-resource-library.service';
import { ResourceDto, ResourceType } from '../../core/services/resource.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-profile-resource-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './profile-resource-list.html',
  styleUrl: './profile-resource-list.css',
})
export class ProfileResourceListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly session = inject(SessionService);
  private readonly library = inject(ProfileResourceLibraryService);

  title = signal('Mes ressources');
  description = signal('');
  kind = signal<ProfileResourceKind>('favorite');
  resources = signal<ResourceDto[]>([]);

  readonly countLabel = computed(() => {
    const count = this.resources().length;

    if (count === 0) return 'Aucune ressource publiée';
    if (count === 1) return '1 ressource publiée';

    return `${count} ressources publiées`;
  });

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
    this.kind.set((this.route.snapshot.data['kind'] as ProfileResourceKind) ?? 'favorite');
    this.title.set((this.route.snapshot.data['title'] as string) ?? 'Mes ressources');
    this.description.set((this.route.snapshot.data['description'] as string) ?? '');

    this.loadResources();
  }

  reload(): void {
    this.loadResources();
  }

  getResourceTypeLabel(type: ResourceType | string | null | undefined): string {
    if (!type) return 'Type non renseigné';

    return this.resourceTypeLabels[type] ?? type;
  }

  private loadResources(): void {
    const userKey = this.getCurrentUserStorageKey();

    if (!userKey) {
      this.resources.set([]);
      return;
    }

    const publishedResources = this.library
      .list(userKey, this.kind())
      .filter((resource) => resource.status === 'PUBLISHED' && resource.resourceIsActive);

    this.resources.set(publishedResources);
  }

  private getCurrentUserStorageKey(): string | null {
    const user = this.session.user();

    return user?.id ?? user?.email ?? user?.pseudo ?? null;
  }
}
