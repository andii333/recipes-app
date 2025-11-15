// Angular
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

// Third-party libraries
import { catchError, delay, finalize, Observable, tap } from 'rxjs';

// Project alias imports
import { IRecipe, IRecipesResponse } from '@models/interfaces/recipe.interface';
import { WarningService } from '@services/warning.service';
import { environment } from '@env/environment';
import { IRecipeQueryParams } from '@models/interfaces/recipe-query-params.interface';

@Injectable({
  providedIn: 'root',
})
export class RecipesService {
  // Dependencies
  private readonly http = inject(HttpClient);
  private readonly warningService = inject(WarningService);

  // API Configuration
  private readonly API_URL = environment.API_URL + '/recipes';

  // State Signals (private)
  private readonly _recipes = signal<IRecipe[]>([]);
  private readonly _tags = signal<string[]>([]);
  private readonly _recipesTotal = signal<number>(0);
  private readonly _activeRecipe = signal<IRecipe | null>(null);
  private readonly _isLoading = signal<boolean>(false);

  // Public readonly Signals
  readonly recipesSignal = this._recipes.asReadonly();
  readonly recipeTagsSignal = this._tags.asReadonly();
  readonly recipesTotalSignal = this._recipesTotal.asReadonly();
  readonly activeRecipeSignal = this._activeRecipe.asReadonly();
  readonly isLoadingSignal = this._isLoading.asReadonly();

  getAllRecipes(params?: IRecipeQueryParams): Observable<IRecipesResponse> {
    this.clearRecipes();

    const httpParams = this.buildHttpParams(params);
    const url = params?.searchText ? `${this.API_URL}/search` : this.API_URL;

    return this.http.get<IRecipesResponse>(url, { params: httpParams }).pipe(
      delay(2000),
      tap((res) => {
        this._recipes.set(res.recipes);
        this._recipesTotal.set(res.total);
      }),
      catchError((err) => this.warningService.handleError(err)),
      finalize(() => this._isLoading.set(false))
    );
  }

  getOneRecipe(recipeId: number): Observable<IRecipe> {
    this._isLoading.set(true);

    return this.http.get<IRecipe>(`${this.API_URL}/${recipeId}`).pipe(
      tap((recipe) => this._activeRecipe.set(recipe)),
      catchError((err) => this.warningService.handleError(err)),
      finalize(() => this._isLoading.set(false))
    );
  }

  getRecipeTags(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/tags`).pipe(
      tap((tags) => this._tags.set(tags)),
      catchError((err) => this.warningService.handleError(err))
    );
  }

  getRecipesByTag(
    tag: string,
    params?: IRecipeQueryParams
  ): Observable<IRecipesResponse> {
    this.clearRecipes();

    const httpParams = this.buildHttpParams(params);
    const url = params?.searchText
      ? `${this.API_URL}/search/tag/${tag}`
      : `${this.API_URL}/tag/${tag}`;

    return this.http.get<IRecipesResponse>(url, { params: httpParams }).pipe(
      tap((res) => {
        this._recipes.set(res.recipes);
        this._recipesTotal.set(res.total);
      }),
      catchError((err) => this.warningService.handleError(err)),
      finalize(() => this._isLoading.set(false))
    );
  }

  updateRecipeInSignal(updated: IRecipe): void {
    this._recipes.update((recipes) =>
      recipes.map((r) => (r.id === updated.id ? updated : r))
    );
  }

  removeRecipeFromSignal(recipeId: number): void {
    this._recipes.update((recipes) => recipes.filter((r) => r.id !== recipeId));
    this._recipesTotal.update((total) => total - 1);
    this.warningService.showSuccessWarning(
      'The recipe was successfully deleted'
    );
  }

  updateActiveRecipe(updated: IRecipe): void {
    this._activeRecipe.set(updated);
  }

  removeActiveRecipe(): void {
    this._activeRecipe.set(null);
  }

  private clearRecipes(): void {
    this._isLoading.set(true);
    this._recipes.set([]);
    this._recipesTotal.set(0);
  }

  private buildHttpParams(params?: IRecipeQueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (!params) return httpParams;

    if (params.searchText) {
      httpParams = httpParams.set('q', params.searchText);
    }
    if (params.limit !== undefined) {
      httpParams = httpParams.set('limit', params.limit);
    }
    if (params.skip !== undefined) {
      httpParams = httpParams.set('skip', params.skip);
    }

    return httpParams;
  }
}
