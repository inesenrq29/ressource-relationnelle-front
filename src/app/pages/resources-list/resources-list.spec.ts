import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcesList } from './resources-list';

describe('ResourcesList', () => {
  let component: ResourcesList;
  let fixture: ComponentFixture<ResourcesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourcesList],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourcesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
