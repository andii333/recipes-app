import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipesTable } from './recipes-table';

describe('RecipesTable', () => {
  let component: RecipesTable;
  let fixture: ComponentFixture<RecipesTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipesTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipesTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
