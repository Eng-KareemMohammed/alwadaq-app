import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PapersPage } from './papers.page';

describe('PapersPage', () => {
  let component: PapersPage;
  let fixture: ComponentFixture<PapersPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PapersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
