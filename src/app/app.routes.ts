import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then((m) => m.Home)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then((m) => m.RegisterComponent)
  },
  {
    path: 'resources/add',
    loadComponent: () =>
      import('./pages/resources/resources').then((m) => m.ResourcesComponent)
  },
  {
    path: 'resources/categories/add',
    loadComponent: () =>
      import('./pages/add-category/add-category').then((m) => m.AddCategoryComponent)
  },
  {
    path: 'resources/all',
    loadComponent: () =>
      import('./pages/resources-list/resources-list').then((m) => m.ResourcesListComponent)
  }
];
