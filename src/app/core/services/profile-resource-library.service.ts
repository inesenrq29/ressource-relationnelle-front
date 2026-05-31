import { Injectable } from '@angular/core';

import { ResourceDto } from './resource.service';

export type ProfileResourceKind = 'favorite' | 'set-aside' | 'exploited';

@Injectable({
  providedIn: 'root',
})
export class ProfileResourceLibraryService {
  add(userId: string, kind: ProfileResourceKind, resource: ResourceDto): void {
    const resources = this.list(userId, kind);
    const normalizedResource = this.normalizeResource(resource);
    const nextResources = [
      normalizedResource,
      ...resources.filter((item) => item.resourceId !== normalizedResource.resourceId),
    ];

    localStorage.setItem(this.getStorageKey(userId, kind), JSON.stringify(nextResources));
  }

  remove(userId: string, kind: ProfileResourceKind, resourceId: string): void {
    const resources = this.list(userId, kind).filter((item) => item.resourceId !== resourceId);

    localStorage.setItem(this.getStorageKey(userId, kind), JSON.stringify(resources));
  }

  list(userId: string, kind: ProfileResourceKind): ResourceDto[] {
    const rawValue = localStorage.getItem(this.getStorageKey(userId, kind));

    if (!rawValue) {
      return [];
    }

    try {
      const resources = JSON.parse(rawValue) as ResourceDto[];

      return Array.isArray(resources)
        ? resources.map((resource) => this.normalizeResource(resource))
        : [];
    } catch {
      localStorage.removeItem(this.getStorageKey(userId, kind));
      return [];
    }
  }

  has(userId: string, kind: ProfileResourceKind, resourceId: string): boolean {
    return this.list(userId, kind).some((resource) => resource.resourceId === resourceId);
  }

  clearAllForUser(userId: string): void {
    localStorage.removeItem(this.getStorageKey(userId, 'favorite'));
    localStorage.removeItem(this.getStorageKey(userId, 'set-aside'));
    localStorage.removeItem(this.getStorageKey(userId, 'exploited'));
  }

  private getStorageKey(userId: string, kind: ProfileResourceKind): string {
    return `rr_profile_${userId}_${kind}`;
  }

  private normalizeResource(resource: ResourceDto): ResourceDto {
    return {
      ...resource,
      tags: resource.tags ?? [],
    };
  }
}
