import { NgClass } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TableModule, TablePageEvent } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { RecipesService } from '../../../../services/recipes-service';
import { IRecipe } from '../../../../models/interfaces/recipe.interface';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { WarningService } from '../../../../services/warning.service';
import { DialogModule } from 'primeng/dialog';
import { RecipeForm } from '../../components/recipe-form/recipe-form';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
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
    ConfirmDialogModule,
    DialogModule,
    RecipeForm,
    ProgressSpinnerModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './recipes-table.html',
  styleUrl: './recipes-table.scss',
})
export class RecipesTable implements OnInit {
  private recipesService = inject(RecipesService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private warningService = inject(WarningService);
  recipesSignal = this.recipesService.recipesSignal;
  recipeTagsSignal = this.recipesService.recipeTagsSignal;
  recipesTotalSignal = this.recipesService.recipesTotalSignal;
  selectedTag = 'All Tags';
  pageSize = 5;
  limit = 0;
  searchControl = new FormControl('');
  visibleRecipeForm = false;
  activeRecipeSignal = signal<number | null>(null);
  isLoadingSignal = this.recipesService.isLoadingSignal;

  get recipeTagOptions(): string[] {
    return ['All Tags', ...this.recipeTagsSignal()];
  }

  ngOnInit(): void {
    if (this.recipesSignal().length !== 0) return;
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

  onPageChange(event: TablePageEvent) {
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

  onDelete(recipeId: number) {
    this.recipesService.removeRecipeFromSignal(recipeId);
    this.warningService.showSuccessWarning(
      'The recipe was successfully deleted'
    );
  }

  confirmDelete(event: Event, recipeId: number) {
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
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmed',
          detail: 'Record deleted',
        });
        this.onDelete(recipeId);
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Rejected',
          detail: 'You have rejected',
        });
      },
    });
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

  onView(recipe: IRecipe) {
    this.router.navigate(['/recipes', recipe.id], {
      queryParamsHandling: 'preserve',
    });
  }

  onEdit(recipeId: number) {
    this.activeRecipeSignal.set(recipeId);
    this.visibleRecipeForm = true;
  }

  closeDialog() {
    this.visibleRecipeForm = false;
    this.activeRecipeSignal.set(null);
  }
}
