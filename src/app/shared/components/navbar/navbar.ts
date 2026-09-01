import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AuthService } from '../../../core/services/auth';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly session = inject(SessionService);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canSeeAdminMenu(): boolean {
    return (
      this.canManageResources() ||
      this.canManageCategories() ||
      this.canManageUsers() ||
      this.canSeeStats()
    );
  }

  canManageResources(): boolean {
    const role = this.session.role();

    return role === 'MODERATOR' || role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  canManageCategories(): boolean {
    const role = this.session.role();

    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  canManageUsers(): boolean {
    return this.session.role() === 'SUPER_ADMIN';
  }

  canSeeStats(): boolean {
    const role = this.session.role();

    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/');
      },
      error: () => {
        this.authService.clearSession();
        this.router.navigateByUrl('/');
      },
    });
  }
}
