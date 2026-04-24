import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ResourceDto, ResourceService } from '../../core/services/resource.service';

@Component({
  selector: 'app-resources-list',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './resources-list.html',
  styleUrl: './resources-list.css'
})
export class ResourcesListComponent implements OnInit {
  private readonly resourceService = inject(ResourceService);

  loading = true;
  errorMessage = '';
  resources: ResourceDto[] = [];

  ngOnInit(): void {
    this.resourceService.getResources().subscribe({
      next: (resources) => {
        this.resources = resources;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les ressources.';
        this.loading = false;
      }
    });
  }
}
