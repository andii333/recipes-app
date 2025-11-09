import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeDetailed } from './recipe-detailed';

describe('RecipeDetailed', () => {
  let component: RecipeDetailed;
  let fixture: ComponentFixture<RecipeDetailed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeDetailed]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeDetailed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
