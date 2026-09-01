import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCategory } from './add-category';

describe('AddCategory', () => {
  let component: AddCategory;
  let fixture: ComponentFixture<AddCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCategory],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCategory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
