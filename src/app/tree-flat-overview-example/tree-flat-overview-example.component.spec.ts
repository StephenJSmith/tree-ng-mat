import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeFlatOverviewExampleComponent } from './tree-flat-overview-example.component';

describe('TreeFlatOverviewExampleComponent', () => {
  let component: TreeFlatOverviewExampleComponent;
  let fixture: ComponentFixture<TreeFlatOverviewExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeFlatOverviewExampleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TreeFlatOverviewExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
