import { NgClass } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { RecipesService } from '../../../../services/recipes-service';
import { IRecipe } from '../../../../models/interfaces/recipe.interface';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-recipes-table',
  imports: [
    SelectModule,
    FormsModule,
    TableModule,
    NgClass,
    ChipModule,
    InputText,
    Button,
    ReactiveFormsModule,
  ],
  templateUrl: './recipes-table.html',
  styleUrl: './recipes-table.scss',
})
export class RecipesTable implements OnInit {
  private recipesService = inject(RecipesService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  recipesSignal = this.recipesService.recipesSignal;
  recipeTagsSignal = this.recipesService.recipeTagsSignal;
  recipesTotalSignal = this.recipesService.recipesTotalSignal;
  selectedTag: string = 'All Tags';
  pageSize = 5;
  limit = 0;
  searchControl = new FormControl('');

  get recipeTagOptions(): string[] {
    return ['All Tags', ...this.recipeTagsSignal()];
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const search = params.get('search') ?? '';
        const tag = params.get('tag') ?? 'All Tags';
        const page = +(params.get('page') ?? '0');
        const size = +(params.get('size') ?? this.pageSize);

        this.searchControl.setValue(search, { emitEvent: false });
        this.selectedTag = tag;
        this.pageSize = size;
        this.limit = page * size;

        if (tag !== 'All Tags') {
          this.recipesService.getRecipesByTag(
            tag,
            this.pageSize,
            this.limit,
            search
          );
        } else {
          this.recipesService.getAllRecipes(this.pageSize, this.limit, search);
        }
      });

    if (this.recipeTagsSignal.length === 0) {
      this.recipesService.getRecipeTags();
    }
    this.onSearchChange();
  }

  onSearchChange() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((searchText: string | null) => {
        if (searchText) this.selectedTag = 'All Tags';
        this.limit = 0;
        this.recipesService.getAllRecipes(this.pageSize, 0, searchText ?? '');
        this.updateUrl({
          search: searchText ?? undefined,
          tag: this.selectedTag,
          page: 0,
        });
      });
  }

  onPageChange(event: any) {
    const skip = event.first;
    const limit = event.rows;
    this.pageSize = limit;
    const page = skip / limit;

    if (this.selectedTag !== 'All Tags') {
      this.recipesService.getRecipesByTag(this.selectedTag, limit, skip);
    } else {
      this.recipesService.getAllRecipes(limit, skip);
    }
    this.updateUrl({ page });
  }

  onTagChange(tag: string) {
    this.searchControl.reset();
    if (this.selectedTag !== 'All Tags') {
      this.recipesService.getRecipesByTag(tag, this.pageSize);
    } else {
      this.recipesService.getAllRecipes(
        this.pageSize,
        0,
        this.searchControl.value ?? ''
      );
    }
    this.updateUrl({ tag, page: 0, search: '' });
  }
  onDelete(recipe: IRecipe) {
    this.recipesService.removeRecipeFromSignal(recipe.id);
  }

  private updateUrl(params: {
    search?: string;
    tag?: string;
    page?: number;
    size?: number;
  }) {
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
