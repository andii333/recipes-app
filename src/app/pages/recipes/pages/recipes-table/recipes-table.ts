// Angular
import { NgClass } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Third-party libraries
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule, TablePageEvent } from 'primeng/table';
import { debounceTime, distinctUntilChanged } from 'rxjs';

// Project alias imports
import { IRecipe } from '@models/interfaces/recipe.interface';
import { RecipeForm } from '@pages/recipes/components/recipe-form/recipe-form';
import { RecipesService } from '@services/recipes-service';
import { WarningService } from '@services/warning.service';

@Component({
  selector: 'app-recipes-table',
  imports: [
    SelectModule,
    TableModule,
    NgClass,
    ChipModule,
    InputText,
    Button,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    DialogModule,
    RecipeForm,
    ProgressSpinnerModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './recipes-table.html',
  styleUrl: './recipes-table.scss',
})
export class RecipesTable implements OnInit {
  // Constants
  private readonly ALL_TAGS = 'All Tags';
  private readonly DEFAULT_PAGE_SIZE = 5;
  private readonly SEARCH_DEBOUNCE_TIME = 300;

  // Dependencies
  private readonly recipesService = inject(RecipesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly warningService = inject(WarningService);

  // Signals from service
  readonly recipesSignal = this.recipesService.recipesSignal;
  readonly recipeTagsSignal = this.recipesService.recipeTagsSignal;
  readonly recipesTotalSignal = this.recipesService.recipesTotalSignal;
  readonly isLoadingSignal = this.recipesService.isLoadingSignal;

  // Local state
  readonly activeRecipeSignal = signal<number | null>(null);
  readonly searchControl = new FormControl('');

  selectedTag = this.ALL_TAGS;
  pageSize = this.DEFAULT_PAGE_SIZE;
  limit = 0;
  visibleRecipeForm = false;

  private isInitialized = false;

  get recipeTagOptions(): string[] {
    return [this.ALL_TAGS, ...this.recipeTagsSignal()];
  }

  ngOnInit(): void {
    if (this.recipesSignal().length !== 0) return;

    this.initializeFromQueryParams();
    this.loadRecipeTagsIfNeeded();
    this.onSearchChange();
  }

  onPageChange(event: TablePageEvent): void {
    const skip = event.first;
    const limit = event.rows;
    this.pageSize = limit;
    this.limit = skip;
    const page = skip / limit;

    this.updateUrl({ page });
    this.loadRecipes({ limit, skip });
  }

  onTagChange(tag: string): void {
    this.selectedTag = tag;
    this.limit = 0;
    this.searchControl.setValue('', { emitEvent: false });
    this.updateUrl({ tag, page: 0, search: '' });
    this.loadRecipes({ limit: this.pageSize, skip: 0 });
  }

  onDelete(recipeId: number): void {
    this.recipesService.removeRecipeFromSignal(recipeId);
  }

  confirmDelete(event: Event, recipeId: number): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Do you want to delete this recipe?',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        this.onDelete(recipeId);
      },
      reject: () => {
        this.warningService.showErrorWarning('Failed to delete the recipe');
      },
    });
  }

  onView(recipe: IRecipe): void {
    this.router.navigate(['/recipes', recipe.id], {
      queryParamsHandling: 'preserve',
    });
  }

  onEdit(recipeId: number): void {
    this.activeRecipeSignal.set(recipeId);
    this.visibleRecipeForm = true;
  }

  closeDialog(): void {
    this.visibleRecipeForm = false;
    this.activeRecipeSignal.set(null);
  }

  // Private methods
  private onSearchChange(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(this.SEARCH_DEBOUNCE_TIME),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((searchText: string | null) => {
        if (searchText) {
          this.selectedTag = this.ALL_TAGS;
        }

        this.limit = 0;
        this.updateUrl({
          search: searchText ?? undefined,
          tag: this.selectedTag,
          page: 0,
        });
        this.loadRecipes({ searchText: searchText ?? '' });
      });
  }

  private initializeFromQueryParams(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const search = params.get('search') ?? '';
        const tag = params.get('tag') ?? this.ALL_TAGS;
        const page = +(params.get('page') ?? '0');
        const size = +(params.get('size') ?? this.DEFAULT_PAGE_SIZE);

        this.searchControl.setValue(search, { emitEvent: false });
        this.selectedTag = tag;
        this.pageSize = size;
        this.limit = page * size;

        if (!this.isInitialized) {
          this.isInitialized = true;
          this.loadRecipes({
            limit: this.pageSize,
            skip: this.limit,
            searchText: search,
          });
        }
      });
  }

  private loadRecipeTagsIfNeeded(): void {
    if (this.recipeTagsSignal().length === 0) {
      this.recipesService.getRecipeTags().subscribe();
    }
  }

  private loadRecipes(options: {
    limit?: number;
    skip?: number;
    searchText?: string;
  }): void {
    const { limit, skip, searchText } = options;
    const params = {
      limit: limit ?? this.pageSize,
      skip: skip ?? this.limit,
      searchText: searchText ?? this.searchControl.value ?? '',
    };

    if (this.selectedTag !== this.ALL_TAGS) {
      this.recipesService.getRecipesByTag(this.selectedTag, params).subscribe();
    } else {
      this.recipesService.getAllRecipes(params).subscribe();
    }
  }

  private updateUrl(params: {
    search?: string;
    tag?: string;
    page?: number;
    size?: number;
  }): void {
    const queryParams = {
      search: params.search ?? this.searchControl.value ?? '',
      tag: params.tag ?? this.selectedTag,
      page: params.page ?? this.limit / this.pageSize,
      size: params.size ?? this.pageSize,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
