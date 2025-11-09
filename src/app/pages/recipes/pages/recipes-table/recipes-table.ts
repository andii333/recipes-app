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
  recipesSignal = this.recipesService.recipesSignal;
  recipeTagsSignal = this.recipesService.recipeTagsSignal;
  recipesTotalSignal = this.recipesService.recipesTotalSignal;
  selectedRecipe!: IRecipe;
  pageSize = 5;
  limit = 0;
  currentTag: string | null = null;
  searchControl = new FormControl('');

  get recipeTagOptions(): string[] {
    return ['All Tags', ...this.recipeTagsSignal()];
  }

  get recipes(): IRecipe[] {
    const tags = this.currentTag;
    if (tags) {
      return this.recipesSignal().filter((recipe) =>
        recipe.tags.includes(tags)
      );
    } else {
      return this.recipesSignal();
    }
  }

  ngOnInit(): void {
    if (this.recipesService.recipesSignal.length === 0) {
      this.recipesService.getAllRecipes(this.pageSize, this.limit);
    }
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
        if (this.currentTag && !searchText)
          this.recipesService.getRecipesByTag(this.currentTag, this.pageSize);
        else
          this.recipesService.getAllRecipes(this.pageSize, 0, searchText ?? '');
      });
  }

  onPageChange(event: any) {
    const skip = event.first;
    const limit = event.rows;
    this.pageSize = limit;

    if (this.currentTag) {
      this.recipesService.getRecipesByTag(this.currentTag, limit, skip);
    } else {
      this.recipesService.getAllRecipes(limit, skip);
    }
  }

  onTagChange(tag: string) {
    this.currentTag = tag !== 'All Tags' ? tag : null;
    if (this.currentTag) {
      this.recipesService.getRecipesByTag(tag, this.pageSize);
    } else {
      this.recipesService.getAllRecipes(
        this.pageSize,
        0,
        this.searchControl.value ?? ''
      );
    }
  }
}
