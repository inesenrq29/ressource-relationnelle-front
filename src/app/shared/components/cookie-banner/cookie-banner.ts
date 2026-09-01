import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './cookie-banner.html',
  styleUrl: './cookie-banner.css',
})
export class CookieBanner {
  private readonly storageKey = 'rr_cookie_choice';

  isVisible = !localStorage.getItem(this.storageKey);

  acceptCookies(): void {
    localStorage.setItem(this.storageKey, 'accepted');
    this.isVisible = false;
  }

  refuseCookies(): void {
    localStorage.setItem(this.storageKey, 'refused');
    this.isVisible = false;
  }
}
