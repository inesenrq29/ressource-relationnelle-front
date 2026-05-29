import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.RegisterComponent),
  },
  {
    path: 'aide',
    loadComponent: () => import('./pages/help/help').then((m) => m.HelpComponent),
  },
  {
    path: 'resources',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/resources-list/resources-list').then((m) => m.ResourcesListComponent),
  },
  {
    path: 'resources/add',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/resources/resources').then((m) => m.ResourcesComponent),
  },
  {
    path: 'resources/categories/add',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['ADMIN', 'SUPER_ADMIN'],
    },
    loadComponent: () =>
      import('./pages/add-category/add-category').then((m) => m.AddCategoryComponent),
  },
  {
    path: 'resources/:resourceId/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/resource-edit/resource-edit').then((m) => m.ResourceEditComponent),
  },
  {
    path: 'resources/:resourceId',
    loadComponent: () =>
      import('./pages/resource-detail/resource-detail').then((m) => m.ResourceDetailComponent),
  },
  {
    path: 'profile/favorites',
    canActivate: [authGuard],
    data: {
      kind: 'favorite',
      title: 'Mes favoris',
      description: 'Retrouve les ressources que tu as ajoutées à tes favoris.',
    },
    loadComponent: () =>
      import('./pages/profile-resource-list/profile-resource-list').then(
        (m) => m.ProfileResourceListComponent,
      ),
  },
  {
    path: 'profile/set-aside',
    canActivate: [authGuard],
    data: {
      kind: 'set-aside',
      title: 'Mes ressources mises de côté',
      description: 'Retrouve les ressources que tu souhaites consulter plus tard.',
    },
    loadComponent: () =>
      import('./pages/profile-resource-list/profile-resource-list').then(
        (m) => m.ProfileResourceListComponent,
      ),
  },
  {
    path: 'profile/exploited',
    canActivate: [authGuard],
    data: {
      kind: 'exploited',
      title: 'Mes ressources exploitées',
      description: 'Retrouve les ressources que tu as déjà utilisées.',
    },
    loadComponent: () =>
      import('./pages/profile-resource-list/profile-resource-list').then(
        (m) => m.ProfileResourceListComponent,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
  },
  {
    path: 'admin/resources',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
    },
    loadComponent: () =>
      import('./pages/admin-resources/admin-resources').then((m) => m.AdminResourcesComponent),
  },
  {
    path: 'admin/comments',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
    },
    loadComponent: () =>
      import('./pages/admin-comments/admin-comments').then((m) => m.AdminCommentsComponent),
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['SUPER_ADMIN'],
    },
    loadComponent: () =>
      import('./pages/admin-users/admin-users').then((m) => m.AdminUsersComponent),
  },
  {
    path: 'admin/stats',
    canActivate: [authGuard, roleGuard],
    data: {
      roles: ['ADMIN', 'SUPER_ADMIN'],
    },
    loadComponent: () =>
      import('./pages/admin-stats/admin-stats').then((m) => m.AdminStatsComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
