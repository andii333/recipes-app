import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { noAuthGuard } from './guards/no-auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    canActivate: [noAuthGuard],
  },
  {
    path: 'recipes',
    loadComponent: () =>
      import('./pages/recipes/recipes').then((m) => m.Recipes),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/recipes/pages/recipes-table/recipes-table').then(
            (m) => m.RecipesTable
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/recipes/pages/recipe-detailed/recipe-detailed').then(
            (m) => m.RecipeDetailed
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
