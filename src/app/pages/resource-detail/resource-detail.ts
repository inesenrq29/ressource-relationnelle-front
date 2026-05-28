import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import {
  CommentDto,
  ResourceDto,
  ResourceService,
  ResourceType,
} from '../../core/services/resource.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-resource-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './resource-detail.html',
  styleUrl: './resource-detail.css',
})
export class ResourceDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly resourceService = inject(ResourceService);
  protected readonly session = inject(SessionService);

  loading = signal(true);
  errorMessage = signal('');
  resource = signal<ResourceDto | null>(null);

  comments = signal<CommentDto[]>([]);
  commentsLoading = signal(false);
  commentsError = signal('');

  isFavorite = signal(false);
  isSetAside = signal(false);
  isExploited = signal(false);
  actionLoading = signal(false);

  copySuccess = signal(false);

  commentTitle = signal('');
  commentContent = signal('');
  commentSubmitting = signal(false);
  commentSuccess = signal('');
  commentError = signal('');

  readonly approvedComments = computed(() =>
    [...this.comments()]
      .filter((comment) => comment.status === 'APPROVED')
      .sort(
        (first, second) =>
          new Date(second.publicationDate).getTime() - new Date(first.publicationDate).getTime(),
      ),
  );

  readonly commentsCountLabel = computed(() => {
    const count = this.approvedComments().length;

    if (count === 0) return 'Aucun commentaire publié';
    if (count === 1) return '1 commentaire publié';

    return `${count} commentaires publiés`;
  });

  readonly canEdit = computed(() => {
    if (!this.session.isLoggedIn()) return false;
    if (this.session.isAdmin()) return true;

    const res = this.resource();

    if (!res?.creatorId) return false;

    return res.creatorId === this.session.user()?.id;
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
    const resourceId = this.route.snapshot.paramMap.get('resourceId');

    if (!resourceId) {
      this.loading.set(false);
      this.errorMessage.set('Identifiant de ressource introuvable.');
      return;
    }

    this.loadResource(resourceId);
    this.loadComments(resourceId);
  }

  copyLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    });
  }

  toggleFavorite(): void {
    const userId = this.session.user()?.id;
    const resourceId = this.resource()?.resourceId;

    if (!userId || !resourceId || this.actionLoading()) return;

    this.actionLoading.set(true);
    const was = this.isFavorite();
    const call = was
      ? this.resourceService.removeResourceFromFavorite(userId, resourceId)
      : this.resourceService.addResourceToFavorite(userId, resourceId);

    call.subscribe({
      next: () => {
        this.isFavorite.set(!was);
        this.actionLoading.set(false);
      },
      error: () => {
        this.actionLoading.set(false);
      },
    });
  }

  toggleSetAside(): void {
    const userId = this.session.user()?.id;
    const resourceId = this.resource()?.resourceId;

    if (!userId || !resourceId || this.actionLoading()) return;

    this.actionLoading.set(true);
    const was = this.isSetAside();
    const call = was
      ? this.resourceService.unsetAsideResource(userId, resourceId)
      : this.resourceService.setAsideResource(userId, resourceId);

    call.subscribe({
      next: () => {
        this.isSetAside.set(!was);
        this.actionLoading.set(false);
      },
      error: () => {
        this.actionLoading.set(false);
      },
    });
  }

  toggleExploited(): void {
    const userId = this.session.user()?.id;
    const resourceId = this.resource()?.resourceId;

    if (!userId || !resourceId || this.actionLoading()) return;

    this.actionLoading.set(true);
    const was = this.isExploited();
    const call = was
      ? this.resourceService.markResourceAsUnexploited(userId, resourceId)
      : this.resourceService.markResourceAsExploited(userId, resourceId);

    call.subscribe({
      next: () => {
        this.isExploited.set(!was);
        this.actionLoading.set(false);
      },
      error: () => {
        this.actionLoading.set(false);
      },
    });
  }

  submitComment(): void {
    const userId = this.session.user()?.id;
    const resourceId = this.resource()?.resourceId;
    const content = this.commentContent().trim();

    if (!userId || !resourceId || !content || this.commentSubmitting()) return;

    this.commentSubmitting.set(true);
    this.commentSuccess.set('');
    this.commentError.set('');

    const title = this.commentTitle().trim();

    this.resourceService
      .addComment(userId, resourceId, {
        ...(title ? { titleComments: title } : {}),
        commentsContent: content,
      })
      .subscribe({
        next: () => {
          this.commentTitle.set('');
          this.commentContent.set('');
          this.commentSuccess.set('Votre commentaire est en attente de modération.');
          this.commentSubmitting.set(false);
          this.loadComments(resourceId);
        },
        error: () => {
          this.commentError.set('Impossible de publier le commentaire. Réessayez plus tard.');
          this.commentSubmitting.set(false);
        },
      });
  }

  reloadComments(): void {
    const resourceId = this.resource()?.resourceId;

    if (!resourceId) return;

    this.loadComments(resourceId);
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

    return status ? (labels[status] ?? status) : 'Statut inconnu';
  }

  getAuthorInitial(author: string): string {
    return author.trim().charAt(0).toUpperCase() || '?';
  }

  private loadResource(resourceId: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.resourceService.getResourceById(resourceId).subscribe({
      next: (resource) => {
        this.resource.set({ ...resource, tags: resource.tags ?? [] });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger cette ressource.');
        this.loading.set(false);
      },
    });
  }

  private loadComments(resourceId: string): void {
    this.commentsLoading.set(true);
    this.commentsError.set('');

    this.resourceService.getCommentsByResource(resourceId).subscribe({
      next: (comments) => {
        this.comments.set(comments ?? []);
        this.commentsLoading.set(false);
      },
      error: () => {
        this.commentsError.set('Impossible de charger les commentaires.');
        this.commentsLoading.set(false);
      },
    });
  }
}
