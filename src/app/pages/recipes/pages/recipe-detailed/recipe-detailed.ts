// Angular
import { NgClass } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

// Third-party libraries
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Project alias imports
import { RecipeForm } from '@pages/recipes/components/recipe-form/recipe-form';
import { RecipesService } from '@services/recipes-service';
import { WarningService } from '@services/warning.service';

@Component({
  selector: 'app-recipe-detailed',
  imports: [
    Button,
    NgClass,
    ConfirmPopupModule,
    ConfirmDialogModule,
    DialogModule,
    RecipeForm,
    ProgressSpinnerModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './recipe-detailed.html',
  styleUrl: './recipe-detailed.scss',
})
export class RecipeDetailed implements OnInit {
  // Input
  @Input() id!: string;

  // Services
  private readonly router = inject(Router);
  private readonly recipesService = inject(RecipesService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly warningService = inject(WarningService);

  // Signals
  recipeSignal = this.recipesService.activeRecipeSignal;
  isLoadingSignal = this.recipesService.isLoadingSignal;

  // Dialog state
  visibleRecipeForm = false;
  activeRecipe: number | null = null;

  // Computed
  get recipeId(): number {
    return +this.id;
  }

  ngOnInit(): void {
    this.recipesService.removeActiveRecipe();
    this.recipesService.getOneRecipe(this.recipeId).subscribe();
  }

  backToList(): void {
    this.router.navigate(['/recipes'], { queryParamsHandling: 'preserve' });
  }

  confirmDelete(event: Event): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Do you want to delete this recipe?',
      icon: 'pi pi-info-circle',
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
        this.onDelete();
      },
      reject: () => {
        this.warningService.showErrorWarning('Failed to delete the recipe');
      },
    });
  }

  onDelete(): void {
    this.recipesService.removeRecipeFromSignal(this.recipeId);
    this.backToList();
  }

  onEdit(recipeId: number): void {
    this.activeRecipe = recipeId;
    this.visibleRecipeForm = true;
  }

  closeDialog(): void {
    this.visibleRecipeForm = false;
    this.activeRecipe = null;
  }
}
