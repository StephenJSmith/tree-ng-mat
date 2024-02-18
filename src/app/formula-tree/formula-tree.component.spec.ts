import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaTreeComponent } from './formula-tree.component';

describe('FormulaTreeComponent', () => {
  let component: FormulaTreeComponent;
  let fixture: ComponentFixture<FormulaTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaTreeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormulaTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
