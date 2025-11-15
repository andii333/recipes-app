// Angular
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
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
    Button,
    ProgressSpinnerModule,
  ],
  templateUrl: './recipe-form.html',
  styleUrl: './recipe-form.scss',
})
export class RecipeForm implements OnInit, OnChanges {
  // Inputs/Outputs
  @Input() recipeId!: number;
  @Output() closeDialog = new EventEmitter<void>();

  // Services
  private readonly recipesService = inject(RecipesService);
  private readonly fb = inject(FormBuilder);

  // Form Group
  recipeForm!: FormGroup;

  // Signals
  recipeSignal = this.recipesService.activeRecipeSignal;

  // Dropdown options
  readonly difficulties = [
    { label: 'Easy', value: 'Easy' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Hard', value: 'Hard' },
  ];

  // Temporary input values
  newTag = '';
  newIngredient = '';
  newInstruction = '';
  newMealType = '';

  // Lifecycle management
  ngOnInit(): void {
    this.recipeForm = this.createForm();
  }

  ngOnChanges(): void {
    if (this.recipeId) {
      this.recipesService
        .getOneRecipe(this.recipeId)
        .subscribe((recipe) => this.populateForm(recipe));
    } else {
      this.resetForm();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      name: ['', Validators.required],
      image: ['', Validators.required],
      cuisine: ['', Validators.required],
      difficulty: ['', Validators.required],
      prepTimeMinutes: [null, Validators.required],
      cookTimeMinutes: [null, Validators.required],
      servings: [null, Validators.required],
      caloriesPerServing: [null, Validators.required],
      rating: [null],
      reviewCount: [null],
      ingredients: this.fb.array([]),
      instructions: this.fb.array([]),
      tags: this.fb.array([]),
      mealType: this.fb.array([]),
    });
  }

  private populateForm(recipe: IRecipe): void {
    this.recipeForm.patchValue({
      id: recipe.id,
      name: recipe.name,
      image: recipe.image,
      cuisine: recipe.cuisine,
      difficulty: recipe.difficulty,
      prepTimeMinutes: recipe.prepTimeMinutes,
      cookTimeMinutes: recipe.cookTimeMinutes,
      servings: recipe.servings,
      caloriesPerServing: recipe.caloriesPerServing,
      rating: recipe.rating,
      reviewCount: recipe.reviewCount,
    });

    this.populateFormArray(this.ingredients, recipe.ingredients || []);
    this.populateFormArray(this.instructions, recipe.instructions || []);
    this.populateFormArray(this.tags, recipe.tags || []);
    this.populateFormArray(this.mealType, recipe.mealType || []);
  }

  private populateFormArray(formArray: FormArray, items: string[]): void {
    formArray.clear();

    items.forEach((item) => {
      formArray.push(this.fb.control(item, Validators.required));
    });
  }

  private resetForm(): void {
    this.recipeForm.reset({
      id: null,
      name: '',
      image: '',
      cuisines: '',
      difficulty: '',
      prepTimeMinutes: null,
      cookTimeMinutes: null,
      servings: null,
      caloriesPerServing: null,
      rating: null,
      reviewCount: null,
    });

    this.ingredients.clear();
    this.instructions.clear();
    this.tags.clear();
    this.mealType.clear();
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

  private addArrayItem(
    array: FormArray,
    value: string,
    clearInput: () => void
  ): void {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      array.push(this.fb.control(trimmedValue, Validators.required));
      clearInput();
    }
  }

  private removeArrayItem(array: FormArray, index: number): void {
    array.removeAt(index);
  }

  addIngredient(): void {
    this.addArrayItem(this.ingredients, this.newIngredient, () => {
      this.newIngredient = '';
    });
  }

  removeIngredient(index: number): void {
    this.removeArrayItem(this.ingredients, index);
  }

  addInstruction(): void {
    this.addArrayItem(this.instructions, this.newInstruction, () => {
      this.newInstruction = '';
    });
  }

  removeInstruction(index: number): void {
    this.removeArrayItem(this.instructions, index);
  }

  addTag(): void {
    this.addArrayItem(this.tags, this.newTag, () => {
      this.newTag = '';
    });
  }

  removeTag(index: number): void {
    this.removeArrayItem(this.tags, index);
  }

  addMealType(): void {
    this.addArrayItem(this.mealType, this.newMealType, () => {
      this.newMealType = '';
    });
  }

  removeMealType(index: number): void {
    this.removeArrayItem(this.mealType, index);
  }

  saveRecipe(): void {
    if (this.recipeForm.valid) {
      this.recipesService.updateRecipeInSignal(this.recipeForm.value);
      this.recipesService.updateActiveRecipe(this.recipeForm.value);
      this.closeDialog.emit();
    } else {
      this.recipeForm.markAllAsTouched();
    }
  }
}
