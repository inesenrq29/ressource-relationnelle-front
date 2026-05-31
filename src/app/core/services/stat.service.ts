import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResourceType } from './resource.service';

export interface StatsDashboardDto {
  exploitedResourcesCount: number;
  totalResourcesCount: number;
  resourcesByCategory: Record<string, number>;
  resourcesByType: Record<string, number>;
}

export interface StatsFilterDto {
  resourceType?: ResourceType | null;
  categoryId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class StatService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/stats';

  getStats(): Observable<StatsDashboardDto> {
    return this.http.get<StatsDashboardDto>(this.baseUrl);
  }

  getFilteredStats(filter: StatsFilterDto): Observable<StatsDashboardDto> {
    return this.http.post<StatsDashboardDto>(`${this.baseUrl}/filter`, filter);
  }

  exportStats(filter: StatsFilterDto = {}): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/export`, filter, {
      responseType: 'blob',
    });
  }
}
