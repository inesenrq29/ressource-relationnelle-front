import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { SessionService } from '../../core/services/session.service';
import { ProgressionDto } from '../../core/services/resource.service';
import { ProfileResourceLibraryService } from '../../core/services/profile-resource-library.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  protected readonly session = inject(SessionService);

  private readonly profileResourceLibrary = inject(ProfileResourceLibraryService);

  loading = signal(false);
  errorMessage = signal('');

  progression = signal<ProgressionDto>({
    favoritesCount: 0,
    exploitedCount: 0,
    setAsideCount: 0,
  });

  ngOnInit(): void {
    this.loadLocalProgression();
  }

  private loadLocalProgression(): void {
    const userKey = this.getCurrentUserStorageKey();

    if (!userKey) {
      this.errorMessage.set('Utilisateur introuvable. Veuillez vous reconnecter.');
      return;
    }

    this.progression.set({
      favoritesCount: this.profileResourceLibrary.list(userKey, 'favorite').length,
      setAsideCount: this.profileResourceLibrary.list(userKey, 'set-aside').length,
      exploitedCount: this.profileResourceLibrary.list(userKey, 'exploited').length,
    });
  }

  private getCurrentUserStorageKey(): string | null {
    const user = this.session.user();

    return user?.id ?? user?.email ?? user?.pseudo ?? null;
  }
}
