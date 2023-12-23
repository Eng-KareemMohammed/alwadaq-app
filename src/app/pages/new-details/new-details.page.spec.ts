import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewDetailsPage } from './new-details.page';

describe('NewDetailsPage', () => {
  let component: NewDetailsPage;
  let fixture: ComponentFixture<NewDetailsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(NewDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
