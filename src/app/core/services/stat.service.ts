import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StatsDashboardDto {
  exploitedResourcesCount: number;
  totalResourcesCount: number;
  resourcesByCategory: Record<string, number>;
  resourcesByType: Record<string, number>;
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

  exportStats(): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/export`, {}, { responseType: 'blob' });
  }
}
