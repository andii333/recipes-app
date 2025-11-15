// Angular
import { NgClass } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

// Third-party libraries
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Project alias imports
import { RecipeForm } from '@pages/recipes/components/recipe-form/recipe-form';
import { RecipesService } from '@services/recipes-service';

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
  providers: [ConfirmationService, MessageService],
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
  private readonly messageService = inject(MessageService);

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
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmed',
          detail: 'Record deleted successfully',
          life: 3000,
        });
        this.onDelete();
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Cancelled',
          detail: 'Recipe deletion cancelled',
          life: 3000,
        });
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
