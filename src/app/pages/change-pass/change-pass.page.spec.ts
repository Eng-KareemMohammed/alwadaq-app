import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangePassPage } from './change-pass.page';

describe('ChangePassPage', () => {
  let component: ChangePassPage;
  let fixture: ComponentFixture<ChangePassPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ChangePassPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
