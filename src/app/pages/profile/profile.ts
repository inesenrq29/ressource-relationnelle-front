import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { SessionService } from '../../core/services/session.service';
import {
  ProgressionDto,
  ResourceService,
} from '../../core/services/resource.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  protected readonly session = inject(SessionService);
  private readonly resourceService = inject(ResourceService);

  loading = signal(true);
  errorMessage = signal('');
  progression = signal<ProgressionDto>({
    favoritesCount: 0,
    exploitedCount: 0,
    setAsideCount: 0,
  });

  ngOnInit(): void {
    this.loadProgression();
  }

  private loadProgression(): void {
    const userId = this.session.user()?.id;

    if (!userId) {
      this.loading.set(false);
      this.errorMessage.set('Utilisateur introuvable. Veuillez vous reconnecter.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.resourceService
      .getProgression(userId)
      .pipe(
        catchError((error) => {
          const status = error?.status;
          console.error('[Profile] Erreur progression — HTTP', status, error);
          return of<ProgressionDto>({
            favoritesCount: 0,
            exploitedCount: 0,
            setAsideCount: 0,
          });
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (progression) => {
          this.progression.set(progression);
        },
      });
  }
}
