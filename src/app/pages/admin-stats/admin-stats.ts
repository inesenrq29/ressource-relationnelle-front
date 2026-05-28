import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { StatService, StatsDashboardDto } from '../../core/services/stat.service';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './admin-stats.html',
  styleUrl: './admin-stats.css',
})
export class AdminStatsComponent implements OnInit {
  private readonly statService = inject(StatService);

  loading = signal(true);
  errorMessage = signal('');
  stats = signal<StatsDashboardDto | null>(null);
  exportLoading = signal(false);

  readonly resourceTypeLabels: Partial<Record<string, string>> = {
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
    this.statService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger les statistiques.');
        this.loading.set(false);
      },
    });
  }

  exportCsv(): void {
    if (this.exportLoading()) return;
    this.exportLoading.set(true);

    this.statService.exportStats().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stats.csv';
        a.click();
        URL.revokeObjectURL(url);
        this.exportLoading.set(false);
      },
      error: () => {
        this.exportLoading.set(false);
      },
    });
  }

  entries(obj: Record<string, number> | null | undefined): [string, number][] {
    if (!obj) return [];
    return Object.entries(obj).sort((a, b) => b[1] - a[1]);
  }
}
