import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormulaTreeComponent } from './formula-tree/formula-tree.component';
import { TreeFlatOverviewExampleComponent } from './tree-flat-overview-example/tree-flat-overview-example.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    FormulaTreeComponent, 
    TreeFlatOverviewExampleComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tree-ng-mat';
}
