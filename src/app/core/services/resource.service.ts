import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from './session.service';

export interface CategoryDto {
  categoryId: string;
  name: string;
}

export interface ResourceDto {
  resourceId: string;
  resourceTitle: string;
  resourceDescription: string;
  status: string;
  categoryId: string;
  categoryName: string;
  resourceType: string;
  tags: string[];
  resourceIsActive: boolean;
  resourceCreatedAt: string;
}

export interface CreateResourceRequest {
  resourceTitle: string;
  resourceDescription: string;
  status: 'DRAFT' | 'PENDING_VALIDATION' | 'PUBLISHED' | 'ARCHIVED' | 'RESTRICTED';
  categoryId: string;
  tags: string[];
  resourceType:
    | 'CHALLENGE_CARD'
    | 'EXERCISE_WORKSHOP'
    | 'READING_SHEET'
    | 'ACTIVITY_GAME'
    | 'PDF'
    | 'ARTICLE'
    | 'GAME'
    | 'VIDEO';
}

export interface CreateCategoryRequest {
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private readonly http = inject(HttpClient);
  private readonly sessionService = inject(SessionService);

  private readonly baseUrl = '/api/resources';
  private readonly categoriesUrl = '/api/categories';

  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(this.categoriesUrl, {
      headers: this.buildAuthHeaders()
    });
  }

  getResources(): Observable<ResourceDto[]> {
    return this.http.get<ResourceDto[]>(this.baseUrl, {
      headers: this.buildAuthHeaders()
    });
  }

  createResource(payload: CreateResourceRequest): Observable<ResourceDto> {
    return this.http.post<ResourceDto>(this.baseUrl, payload, {
      headers: this.buildAuthHeaders()
    });
  }

  createCategory(payload: CreateCategoryRequest): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(this.categoriesUrl, payload, {
      headers: this.buildAuthHeaders()
    });
  }

  private buildAuthHeaders(): HttpHeaders {
    const token = this.sessionService.getToken();

    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
