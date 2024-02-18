import { Component, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CdkTreeModule, FlatTreeControl } from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule,
} from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { SelectionModel } from '@angular/cdk/collections';

// https://stackblitz.com/edit/mat-tree-with-drag-and-drop?file=app%2Ftree-flat-overview-example.ts

export class FileNode {
  id: string = '';
  children: FileNode[] = [];
  filename: string = '';
  type: any;
}

export class FileFlatNode {
  constructor(
    public expandable: boolean,
    public filename: string,
    public level: number,
    public type: any,
    public id: string
  ) {}
}

const TREE_DATA = JSON.stringify({
  Picking: {
    Picking: {
      'Picking Instructions': {
        'Picking Instructions': {
          RCV_Instructions: 'Picking Instructions',
          RCV_Acknowledgement: 'I have read Picking Instructions',
          RCV_AcknowledgementESign: 'Electronic Signature',
        },
      },
      'Print Picking Report': {
        'Confirm Batch Details': {
          RCV_Confirm: 'Confirm Batch Detailsperty',
        },
      },
    },
  },
  'Check Order': {
    'Check Order': {
      'Check Order Instructions': {
        'Check Order Instructions': {
          CHK_Instructions: 'Check Order Instructions',
          CHK_Acknowledgment: 'I have read Check Order Instructions',
          CHK_AcknowledgmentESign: 'Electronic Signature',
        },
      },
      'Check Batch': {
        'Check Batch': {
          CHK_Confirm: 'Check Batch',
        },
        'Check Batch Electronic Signature': {
          CHK_BatchReviewStatus:
            'After checking the batch, set the batch status: Pass or Rejected',
          CHK_ConfirmESign: 'Electronic Signature',
        },
      },
    },
  },
  Dispensing: {
    Dispensing: {
      'Dispensing Instructions': {
        'Dispensing Instructions': {
          DSP_Instructions: 'Dispensing Instructions',
          DSP_Acknowledgment: 'I have read Dispensing Instructions',
          DSP_AcknowledgmentESign: 'Electronic Signature',
        },
      },
      'Dispensing Equipment': {
        'Dispensing Equipment Issue': {
          DSP_EquipmentIssue: 'Dispensing Equipment Issue Finished',
        },
      },
      'Dispense Order': {
        'Dispense Order': {
          DSP_Confirm: 'Dispensing finished',
        },
      },
      'Dispense Order Electronic Signature': {
        DSP_ESign: 'Electronic Signature',
      },
    },
  },
  Review: {
    Review: {
      'Review Instructions': {
        REV_Instructions: 'Review Instructions',
        REV_Acknowledgment: 'I have read Review Instructions',
        REV_AcknowledgmentESign: 'Electronic Signature',
      },
      'Review Batch': {
        'Review Batch Pictures': {
          REV_PictureConfirm: 'Take pictures',
        },
        'Review Batch Electronic Signature': {
          REV_ESign: 'Electronic Signature',
        },
        'Confirm Batch Details': {
          REV_Confirm: 'Review Batch',
        },
      },
    },
  },
  Mixing: {
    Mixing: {
      'Mixing Instructions': {
        'Mixing Instructions': {
          MIX_Instructions: 'Mixing Instructions',
          MIX_Acknowledgment: 'I have read Mixing Instructions',
          MIX_AcknowledgmentESign: 'Electronic Signature',
        },
      },
      'Mixing Equipment': {
        'Mixing Equipment Issue': {
          MIX_EquipmentIssue: 'Mixing Equipment Issue Finished',
        },
      },
      Tipping: {
        'Tip all the dispensing bags into Mixing Bin': {
          MIX_Mfg: 'Tipping Finished',
        },
      },
      Mixing: {
        Mixing: {
          'Mixing Instructions': {
            'Mixing Instructions': {
              MIX_StartTime: 'Mixing Start Time',
              MIX_EndTime: 'Mixing End Time',
            },
          },
        },
        'Total Mixing Time': {
          MIX_TotalTime: 'Total Mixing Time',
        },
        'Mixing Electronic Signature': {
          MIX_ESign: 'Electronic Signature',
        },
      },
      'Mixing Bin Transfer': {
        'Mixing Bin Transfer': {
          MIX_AckTransfer: 'Transfer the mixing bin to the manufacturing area',
        },
        'Mxing bin transfer Electronic Signature': {
          MIX_TransferESign: 'Mxing bin transfer Electronic Signature',
        },
      },
    },
  },
});

@Injectable()
export class FileDatabase {
  dataChange = new BehaviorSubject<FileNode[]>([]);

  get data(): FileNode[] {
    return this.dataChange.value;
  }

  constructor() {
    this.initialize();
  }

  initialize() {
    const dataObject = JSON.parse(TREE_DATA);
    const data = this.buildFileTree(dataObject, 0);
    this.dataChange.next(data);
  }

  renumberChangedNodeIds(
    changedNodes: FileNode[],
    level: number,
    parentId: string = '0'
  ) {
    const data = this.renumberNodeLevelIds(changedNodes, level, parentId);
    this.dataChange.next(data);
  }

  private renumberNodeLevelIds(
    changedNodes: FileNode[],
    level: number,
    parentId: string = '0'
  ) {
    const renumberedNodes: FileNode[] = [];
    for (let idx = 0; idx < changedNodes.length; idx++) {
      const element = changedNodes[idx];
      const node = new FileNode();
      node.id = parentId === '0' ? `${idx + 1}` : `${parentId}.${idx + 1}`;
      node.filename = element.filename;
      node.children = element.children.length
        ? this.renumberNodeLevelIds(element.children, level + 1, node.id)
        : [];
      renumberedNodes.push(node);
    }

    return renumberedNodes;
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `FileNode`.
   */
  private buildFileTree(
    obj: { [key: string]: any },
    level: number,
    parentId: string = '0'
  ): FileNode[] {
    return Object.keys(obj).reduce<FileNode[]>((accumulator, key, idx) => {
      const value = obj[key];
      const node = new FileNode();
      node.filename = key;
      /**
       * Make sure your node has an id so we can properly rearrange the tree during drag'n'drop.
       * By passing parentId to buildFileTree, it constructs a path of indexes which make
       * it possible find the exact sub-array that the node was grabbed from when dropped.
       */
      node.id = parentId === '0' ? `${idx + 1}` : `${parentId}.${idx + 1}`;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1, node.id);
        } else {
          node.type = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }
}

@Component({
  selector: 'app-tree-flat-overview-example',
  standalone: true,
  imports: [
    DragDropModule,
    CdkTreeModule,
    MatCheckboxModule,
    MatTreeModule,
    MatIconModule,
    CdkTreeModule,
  ],
  providers: [FileDatabase],
  templateUrl: './tree-flat-overview-example.component.html',
  styleUrl: './tree-flat-overview-example.component.scss',
})
export class TreeFlatOverviewExampleComponent {
  treeControl: FlatTreeControl<FileFlatNode> | null = null;
  treeFlattener: MatTreeFlattener<FileNode, FileFlatNode> | null = null;
  dataSource: MatTreeFlatDataSource<FileNode, FileFlatNode> | null = null;
  // expansion model tracks expansion state
  expansionModel = new SelectionModel<string>(true);
  dragging = false;
  expandTimeout: any;
  expandDelay = 1000;
  validateDrop = false;

  constructor(private database: FileDatabase) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this._getLevel,
      this._isExpandable,
      this._getChildren
    );
    this.treeControl = new FlatTreeControl<FileFlatNode>(
      this._getLevel,
      this._isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );

    this.database.dataChange.subscribe((data) => this.rebuildTreeForData(data));
  }

  transformer = (node: FileNode, level: number) => {
    return new FileFlatNode(
      !!node.children,
      node.filename,
      level,
      node.type,
      node.id
    );
  };
  private _getLevel = (node: FileFlatNode) => node.level;
  private _isExpandable = (node: FileFlatNode) => node.expandable;
  private _getChildren = (node: FileNode): Observable<FileNode[]> =>
    of(node.children);
  hasChild = (_: number, _nodeData: FileFlatNode) => _nodeData.expandable;

  // DRAG AND DROP METHODS

  shouldValidate(event: MatCheckboxChange): void {
    this.validateDrop = event.checked;
  }

  /**
   * This constructs an array of nodes that matches the DOM
   */
  visibleNodes(): FileNode[] {
    const result: FileNode[] = [];

    function addExpandedChildren(node: FileNode, expanded: string[]) {
      result.push(node);
      if (expanded.includes(node.id)) {
        node.children.map((child) => addExpandedChildren(child, expanded));
      }
    }
    this.dataSource!.data.forEach((node) => {
      addExpandedChildren(node, this.expansionModel.selected);
    });
    return result;
  }

  /**
   * Handle the drop - here we rearrange the data based on the drop event,
   * then rebuild the tree.
   * */
  drop(event: CdkDragDrop<string[]>) {
    // console.log('origin/destination', event.previousIndex, event.currentIndex);

    // ignore drops outside of the tree
    if (!event.isPointerOverContainer) return;

    // construct a list of visible nodes, this will match the DOM.
    // the cdkDragDrop event.currentIndex jives with visible nodes.
    // it calls rememberExpandedTreeNodes to persist expand state
    const visibleNodes = this.visibleNodes();

    // deep clone the data source so we can mutate it
    const changedData = JSON.parse(JSON.stringify(this.dataSource!.data));

    // recursive find function to find siblings of node
    function findNodeSiblings(arr: Array<any>, id: string): Array<any> {
      let result, subResult;
      arr.forEach((item, i) => {
        if (item.id === id) {
          result = arr;
        } else if (item.children) {
          subResult = findNodeSiblings(item.children, id);
          if (subResult) result = subResult;
        }
      });

      return result!;
    }

    // determine where to insert the node
    const nodeAtDest = visibleNodes[event.currentIndex];
    const newSiblings = findNodeSiblings(changedData, nodeAtDest.id);
    if (!newSiblings) return;
    const insertIndex = newSiblings.findIndex((s) => s.id === nodeAtDest.id);

    // remove the node from its old place
    const node = event.item.data;
    const siblings = findNodeSiblings(changedData, node.id);
    const siblingIndex = siblings.findIndex((n) => n.id === node.id);
    const nodeToInsert: FileNode = siblings.splice(siblingIndex, 1)[0];
    if (nodeAtDest.id === nodeToInsert.id) return;

    // ensure validity of drop - must be same level
    const nodeAtDestFlatNode = this.treeControl!.dataNodes.find(
      (n) => nodeAtDest.id === n.id
    );
    if (this.validateDrop && nodeAtDestFlatNode!.level !== node.level) {
      alert('Items can only be moved within the same level.');
      return;
    }

    // insert node
    newSiblings.splice(insertIndex, 0, nodeToInsert);

    // rebuild tree with mutated data
    this.rebuildTreeForData(changedData);
    this.database.renumberChangedNodeIds(changedData, 0);
  }

  /**
   * Experimental - opening tree nodes as you drag over them
   */
  dragStart() {
    this.dragging = true;
  }
  dragEnd() {
    this.dragging = false;
  }
  dragHover(node: FileFlatNode) {
    if (this.dragging) {
      clearTimeout(this.expandTimeout);
      this.expandTimeout = setTimeout(() => {
        this.treeControl!.expand(node);
      }, this.expandDelay);
    }
  }
  dragHoverEnd() {
    if (this.dragging) {
      clearTimeout(this.expandTimeout);
    }
  }

  /**
   * The following methods are for persisting the tree expand state
   * after being rebuilt
   */

  rebuildTreeForData(data: any) {
    this.dataSource!.data = data;
    this.expansionModel.selected.forEach((id) => {
      const node = this.treeControl!.dataNodes.find((n) => n.id === id);
      this.treeControl!.expand(node!);
    });
  }

  /**
   * Not used but you might need this to programmatically expand nodes
   * to reveal a particular node
   */
  private expandNodesById(flatNodes: FileFlatNode[], ids: string[]) {
    if (!flatNodes || flatNodes.length === 0) return;
    const idSet = new Set(ids);
    return flatNodes.forEach((node) => {
      if (idSet.has(node.id)) {
        this.treeControl!.expand(node);
        let parent = this.getParentNode(node);
        while (parent) {
          this.treeControl!.expand(parent);
          parent = this.getParentNode(parent);
        }
      }
    });
  }

  private getParentNode(node: FileFlatNode): FileFlatNode | null {
    const currentLevel = node.level;
    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl!.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl!.dataNodes[i];
      if (currentNode.level < currentLevel) {
        return currentNode;
      }
    }

    return null;
  }
}
