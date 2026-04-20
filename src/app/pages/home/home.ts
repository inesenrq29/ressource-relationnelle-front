import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Navbar } from '../../shared/components/navbar/navbar';

interface ResourceType {
  title: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, Navbar],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  resourceTypes: ResourceType[] = [
    {
      title: 'Articles',
      icon: 'article',
      description: 'Découvre des contenus écrits pour mieux comprendre les relations.'
    },
    {
      title: 'Vidéos',
      icon: 'smart_display',
      description: 'Apprends à ton rythme grâce à des formats visuels et accessibles.'
    },
    {
      title: 'Activités',
      icon: 'touch_app',
      description: 'Passe à l’action avec des exercices à vivre seul ou à plusieurs.'
    },
    {
      title: 'PDF',
      icon: 'picture_as_pdf',
      description: 'Retrouve des fiches pratiques à consulter et conserver.'
    },
    {
      title: 'Images',
      icon: 'image',
      description: 'Explore des supports visuels simples, inspirants et pédagogiques.'
    },
    {
      title: 'Audio',
      icon: 'headphones',
      description: 'Écoute des ressources pensées pour le calme, l’écoute et la réflexion.'
    }
  ];
}
