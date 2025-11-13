// Angular
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  inject,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// Third-party libraries
import { Button } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';

// Project alias imports
import { IRecipe } from '@models/interfaces/recipe.interface';
import { RecipesService } from '@services/recipes-service';

@Component({
  selector: 'app-recipe-form',
  imports: [
    ReactiveFormsModule,
    SelectModule,
    InputText,
    InputNumberModule,
    FormsModule,
    Button,
    ProgressSpinnerModule,
  ],
  templateUrl: './recipe-form.html',
  styleUrl: './recipe-form.scss',
})
export class RecipeForm implements OnChanges {
  @Input() recipeId!: number;
  @Output() closeDialog = new EventEmitter<void>();
  recipeForm!: FormGroup;
  private recipesService = inject(RecipesService);
  private fb = inject(FormBuilder);
  recipeSignal = this.recipesService.activeRecipeSignal;
  difficulties = [
    { label: 'Easy', value: 'Easy' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Hard', value: 'Hard' },
  ];
  newTag = '';
  newIngredient = '';
  newInstruction = '';
  newMealType = '';

  ngOnChanges(): void {
    this.recipesService.removeActiveRecipe();
    if (this.recipeId)
      this.recipesService
        .getOneRecipe(this.recipeId)
        .subscribe((recipe) => this.initialForm(recipe));
  }

  initialForm(recipe: IRecipe) {
    this.recipeForm = this.fb.group({
      id: [recipe.id],
      name: [recipe.name, Validators.required],
      image: [recipe.image, Validators.required],
      cuisines: [recipe.cuisine, Validators.required],
      difficulty: [recipe.difficulty, Validators.required],
      prepTimeMinutes: [recipe.prepTimeMinutes, Validators.required],
      cookTimeMinutes: [recipe.cookTimeMinutes, Validators.required],
      servings: [recipe.servings, Validators.required],
      caloriesPerServing: [recipe.caloriesPerServing, Validators.required],
      rating: [recipe.rating],
      reviewCount: [recipe.reviewCount],
      ingredients: this.fb.array(
        (recipe.ingredients || []).map((i) =>
          this.fb.control(i, Validators.required)
        )
      ),
      instructions: this.fb.array(
        (recipe.instructions || []).map((i) =>
          this.fb.control(i, Validators.required)
        )
      ),
      tags: this.fb.array(
        (recipe.tags || []).map((t) => this.fb.control(t, Validators.required))
      ),
      mealType: this.fb.array(
        (recipe.mealType || []).map((t) =>
          this.fb.control(t, Validators.required)
        )
      ),
    });
  }

  get tags(): FormArray {
    return this.recipeForm.get('tags') as FormArray;
  }

  get mealType(): FormArray {
    return this.recipeForm.get('mealType') as FormArray;
  }

  get ingredients(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get instructions(): FormArray {
    return this.recipeForm.get('instructions') as FormArray;
  }

  addIngredient() {
    const value = this.newIngredient.trim();
    if (value) {
      this.ingredients.push(this.fb.control(value, Validators.required));
      this.newIngredient = '';
    }
  }

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  addInstruction() {
    const value = this.newInstruction.trim();
    if (value) {
      this.instructions.push(this.fb.control(value, Validators.required));
      this.newInstruction = '';
    }
  }

  removeInstruction(index: number) {
    this.instructions.removeAt(index);
  }

  addTag() {
    const value = this.newTag.trim();
    if (value) {
      this.tags.push(this.fb.control(value, Validators.required));
      this.newTag = '';
    }
  }

  removeTag(index: number) {
    this.tags.removeAt(index);
  }

  addMealType() {
    const value = this.newMealType.trim();
    if (value) {
      this.mealType.push(this.fb.control(value, Validators.required));
      this.newMealType = '';
    }
  }

  removeMealType(index: number) {
    this.mealType.removeAt(index);
  }

  saveRecipe() {
    if (this.recipeForm.valid) {
      this.recipesService.updateRecipeInSignal(this.recipeForm.value);
      this.recipesService.updateActiveRecipe(this.recipeForm.value);
      this.closeDialog.emit();
    }
  }
}
