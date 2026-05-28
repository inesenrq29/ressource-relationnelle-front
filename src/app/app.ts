import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { CookieBanner } from './shared/components/cookie-banner/cookie-banner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, CookieBanner],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  title = 'ressource-relationnelle';
}
