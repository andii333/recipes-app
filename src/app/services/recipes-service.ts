import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import {
  IRecipe,
  IRecipesResponse,
} from '../models/interfaces/recipe.interface';
import { WarningService } from './warning.service';

@Injectable({
  providedIn: 'root',
})
export class RecipesService {
  private http = inject(HttpClient);
  private warningService = inject(WarningService);
  API_URL = 'https://dummyjson.com/recipes';
  private _recipes = signal<IRecipe[]>([]);
  recipesSignal = this._recipes.asReadonly();
  private _tags = signal<string[]>([]);
  recipeTagsSignal = this._tags.asReadonly();
  private _recipesTotalSignal = signal<number>(0);
  recipesTotalSignal = this._recipesTotalSignal.asReadonly();

  getAllRecipes(limit?: number, skip?: number, searchText?: string): void {
    let httpParams = new HttpParams();

    if (searchText) {
      httpParams = httpParams.set('q', searchText);
    }
    if (limit !== undefined) {
      httpParams = httpParams.set('limit', limit);
    }
    if (skip !== undefined) {
      httpParams = httpParams.set('skip', skip);
    }
    const url = searchText ? `${this.API_URL}/search` : this.API_URL;
    this.http
      .get<IRecipesResponse>(url, { params: httpParams })
      .pipe(
        tap((res) => {
          this._recipes.set(res.recipes);
          this._recipesTotalSignal.set(res.total);
        }),
        catchError((err) => this.warningService.handleError(err))
      )
      .subscribe();
  }

  getOneRecipe(recipeId: number): Observable<IRecipe> {
    return this.http.get<IRecipe>(' https://dummyjson.com/recipes/' + recipeId);
  }

  updateRecipeInSignal(updated: IRecipe): void {
    this._recipes.update((recipes) =>
      recipes.map((r) => (r.id === updated.id ? updated : r))
    );
  }

  removeRecipeFromSignal(recipeId: number): void {
    this._recipes.update((recipes) => recipes.filter((r) => r.id !== recipeId));
    this._recipesTotalSignal.update((total) => total - 1);
  }

  getRecipeTags(): void {
    this.http
      .get<string[]>('https://dummyjson.com/recipes/tags')
      .pipe(
        tap((tags) => this._tags.set(tags)),
        catchError((err) => this.warningService.handleError(err))
      )
      .subscribe();
  }

  getRecipesByTag(
    tag: string,
    limit?: number,
    skip?: number,
    searchText?: string
  ): void {
    let httpParams = new HttpParams();
    if (limit !== undefined) httpParams = httpParams.set('limit', limit);
    if (skip !== undefined) httpParams = httpParams.set('skip', skip);
    if (searchText) httpParams = httpParams.set('q', searchText);

    const url = searchText
      ? `${this.API_URL}/search/tag/${tag}`
      : `${this.API_URL}/tag/${tag}`;

    this.http
      .get<IRecipesResponse>(url, { params: httpParams })
      .pipe(
        tap((res) => {
          this._recipes.set(res.recipes);
          this._recipesTotalSignal.set(res.total);
        }),
        catchError((err) => this.warningService.handleError(err))
      )
      .subscribe();
  }
}
