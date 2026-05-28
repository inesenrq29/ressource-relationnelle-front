import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ResourceStatus =
  | 'DRAFT'
  | 'PENDING_VALIDATION'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'RESTRICTED';

export type ResourceType =
  | 'CHALLENGE_CARD'
  | 'EXERCISE_WORKSHOP'
  | 'READING_SHEET'
  | 'ACTIVITY_GAME'
  | 'PDF'
  | 'ARTICLE'
  | 'GAME'
  | 'VIDEO';

export interface CategoryDto {
  categoryId: string;
  name: string;
}

export interface ResourceDto {
  resourceId: string;
  resourceTitle: string;
  resourceDescription: string;
  status: ResourceStatus;
  categoryId: string;
  categoryName: string;
  resourceType: ResourceType;
  tags: string[];
  resourceIsActive: boolean;
  resourceCreatedAt: string;
  creatorId?: string;
}

export interface CreateResourceRequest {
  resourceTitle: string;
  resourceDescription: string;
  status: ResourceStatus;
  categoryId: string;
  tags: string[];
  resourceType: ResourceType;
}

export interface UpdateResourceRequest {
  resourceTitle: string;
  resourceDescription: string;
  categoryId: string;
  tags: string[];
  resourceType: ResourceType;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface ProgressionDto {
  favoritesCount: number;
  exploitedCount: number;
  setAsideCount: number;
}

export interface CreateCommentRequest {
  titleComments?: string;
  commentsContent: string;
}

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = '/api/resources';
  private readonly categoriesUrl = '/api/categories';
  private readonly commentsUrl = '/api/comments';

  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(this.categoriesUrl);
  }

  getResources(): Observable<ResourceDto[]> {
    return this.http.get<ResourceDto[]>(this.baseUrl);
  }

  getResourceById(resourceId: string): Observable<ResourceDto> {
    return this.http.get<ResourceDto>(`${this.baseUrl}/${resourceId}`);
  }

  filterResources(filter: string): Observable<ResourceDto[]> {
    const params = new HttpParams().set('filter', filter);
    return this.http.get<ResourceDto[]>(`${this.baseUrl}/filter`, { params });
  }

  sortResources(isAscending: boolean): Observable<ResourceDto[]> {
    const params = new HttpParams().set('isAscending', isAscending);
    return this.http.get<ResourceDto[]>(`${this.baseUrl}/sorted`, { params });
  }

  createResource(payload: CreateResourceRequest): Observable<ResourceDto> {
    return this.http.post<ResourceDto>(this.baseUrl, payload);
  }

  updateResource(resourceId: string, payload: UpdateResourceRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${resourceId}`, payload);
  }

  createCategory(payload: CreateCategoryRequest): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(this.categoriesUrl, payload);
  }

  submitResourceForValidation(resourceId: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${resourceId}/submit`, {});
  }

  validateResource(resourceId: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${resourceId}/validate`, {});
  }

  updateResourceStatus(resourceId: string, status: ResourceStatus): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${resourceId}/status`, { status });
  }

  deleteResource(resourceId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${resourceId}`);
  }

  getProgression(userId: string): Observable<ProgressionDto> {
    return this.http.get<ProgressionDto>(`${this.baseUrl}/${userId}/progressions`);
  }

  addResourceToFavorite(userId: string, resourceId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${userId}/favorite/${resourceId}`, {});
  }

  removeResourceFromFavorite(userId: string, resourceId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}/favorite/${resourceId}`);
  }

  setAsideResource(userId: string, resourceId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${userId}/set-aside/${resourceId}`, {});
  }

  unsetAsideResource(userId: string, resourceId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}/set-aside/${resourceId}`);
  }

  markResourceAsExploited(userId: string, resourceId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${userId}/exploited/${resourceId}`, {});
  }

  markResourceAsUnexploited(userId: string, resourceId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}/exploited/${resourceId}`);
  }

  addComment(
    userId: string,
    resourceId: string,
    payload: CreateCommentRequest,
  ): Observable<void> {
    return this.http.post<void>(
      `${this.commentsUrl}/${userId}/resources/${resourceId}`,
      payload,
    );
  }
}
