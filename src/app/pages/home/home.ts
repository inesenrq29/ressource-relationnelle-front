import {
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface ResourceType {
  title: string;
  icon: string;
  description: string;
  points: string[];
  tag: string;

}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements AfterViewInit {
  @ViewChildren('revealBlock') revealBlocks!: QueryList<ElementRef<HTMLElement>>;

  readonly contentTypes = ['Articles', 'Vidéos', 'Activités', 'PDF', 'Images', 'Audio'];

  readonly resourceTypes: ResourceType[] = [
    {
      title: 'Articles',
      icon: 'article',
      tag: 'Lire',
      description: 'Des contenus écrits pour mieux comprendre les dynamiques relationnelles du quotidien.',
      points: ['Formats courts et lisibles', 'Repères concrets', 'Lecture autonome']
    },
    {
      title: 'Vidéos',
      icon: 'smart_display',
      tag: 'Regarder',
      description: 'Des ressources visuelles accessibles pour découvrir des notions et des pratiques pas à pas.',
      points: ['Approche pédagogique', 'Format engageant', 'Visionnage à son rythme']
    },
    {
      title: 'Activités',
      icon: 'toys',
      tag: 'Pratiquer',
      description: 'Des exercices simples à vivre seul, en duo ou en groupe pour passer à l’action.',
      points: ['Mise en pratique', 'Participation active', 'Temps d’échange']
    },
    {
      title: 'PDF',
      icon: 'picture_as_pdf',
      tag: 'Conserver',
      description: 'Des fiches pratiques à garder, relire et partager selon ses besoins.',
      points: ['Support téléchargeable', 'Repères synthétiques', 'Consultation facile']
    },
    {
      title: 'Images',
      icon: 'image',
      tag: 'Visualiser',
      description: 'Des supports visuels clairs pour mieux mémoriser et s’approprier certains messages.',
      points: ['Lecture rapide', 'Formats visuels', 'Accès simplifié']
    },
    {
      title: 'Audio',
      icon: 'headphones',
      tag: 'Écouter',
      description: 'Des contenus sonores conçus pour l’écoute, la réflexion et les temps plus calmes.',
      points: ['Usage flexible', 'Moment d’apaisement', 'Écoute mobile']
    }
  ];

  ngAfterViewInit(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      this.revealBlocks.forEach((block) => block.nativeElement.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px'
      }
    );

    this.revealBlocks.forEach((block) => observer.observe(block.nativeElement));
  }
}
