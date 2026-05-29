import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { CommentDto, CommentStatus, ResourceService } from '../../core/services/resource.service';

type CommentFilter = CommentStatus | 'ALL';

@Component({
  selector: 'app-admin-comments',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './admin-comments.html',
  styleUrl: './admin-comments.css',
})
export class AdminCommentsComponent implements OnInit {
  private readonly resourceService = inject(ResourceService);

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  comments = signal<CommentDto[]>([]);
  selectedFilter = signal<CommentFilter>('PENDING');
  moderationLoadingId = signal<string | null>(null);
  rejectionReasons = signal<Record<string, string>>({});

  readonly filteredComments = computed(() => this.comments());

  readonly countLabel = computed(() => {
    const count = this.filteredComments().length;

    if (count === 0) return 'Aucun commentaire';
    if (count === 1) return '1 commentaire';

    return `${count} commentaires`;
  });

  ngOnInit(): void {
    this.loadComments();
  }

  changeFilter(filter: CommentFilter): void {
    this.selectedFilter.set(filter);
    this.loadComments();
  }

  loadComments(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.resourceService
      .getCommentsForModeration(this.selectedFilter())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (comments) => {
          this.comments.set(
            [...(comments ?? [])].sort(
              (first, second) =>
                new Date(second.publicationDate).getTime() -
                new Date(first.publicationDate).getTime(),
            ),
          );
        },
        error: () => {
          this.errorMessage.set('Impossible de charger les commentaires à modérer.');
        },
      });
  }

  approve(comment: CommentDto): void {
    if (this.moderationLoadingId()) return;

    this.moderationLoadingId.set(comment.commentsId);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.resourceService
      .moderateComment(comment.commentsId, {
        status: 'APPROVED',
      })
      .pipe(finalize(() => this.moderationLoadingId.set(null)))
      .subscribe({
        next: () => {
          this.successMessage.set('Commentaire approuvé.');
          this.loadComments();
        },
        error: () => {
          this.errorMessage.set('Impossible d’approuver ce commentaire.');
        },
      });
  }

  reject(comment: CommentDto): void {
    if (this.moderationLoadingId()) return;

    const reason = this.getRejectionReason(comment.commentsId).trim();

    if (!reason) {
      this.errorMessage.set('Une raison est obligatoire pour refuser un commentaire.');
      return;
    }

    this.moderationLoadingId.set(comment.commentsId);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.resourceService
      .moderateComment(comment.commentsId, {
        status: 'REJECTED',
        moderationReason: reason,
      })
      .pipe(finalize(() => this.moderationLoadingId.set(null)))
      .subscribe({
        next: () => {
          this.successMessage.set('Commentaire refusé.');
          this.clearRejectionReason(comment.commentsId);
          this.loadComments();
        },
        error: () => {
          this.errorMessage.set('Impossible de refuser ce commentaire.');
        },
      });
  }

  setRejectionReason(commentId: string, value: string): void {
    this.rejectionReasons.update((reasons) => ({
      ...reasons,
      [commentId]: value,
    }));
  }

  getRejectionReason(commentId: string): string {
    return this.rejectionReasons()[commentId] ?? '';
  }

  getStatusLabel(status: CommentStatus): string {
    const labels: Record<CommentStatus, string> = {
      PENDING: 'En attente',
      APPROVED: 'Approuvé',
      REJECTED: 'Refusé',
    };

    return labels[status] ?? status;
  }

  getStatusClass(status: CommentStatus): string {
    return `comment-status--${status.toLowerCase()}`;
  }

  private clearRejectionReason(commentId: string): void {
    this.rejectionReasons.update((reasons) => {
      const next = { ...reasons };
      delete next[commentId];

      return next;
    });
  }
}
