import type { CanvasDocument, ToolId } from '@oop-draw/shared';
import { createDocument } from '../document/createDocument';

export class EditorController {
  private document: CanvasDocument;
  private tool: ToolId = 'select';

  constructor(document: CanvasDocument = createDocument()) {
    this.document = document;
  }

  load(document: CanvasDocument): void {
    this.document = document;
  }

  setTool(tool: ToolId): void {
    this.tool = tool;
  }

  getTool(): ToolId {
    return this.tool;
  }

  getSnapshot(): CanvasDocument {
    return this.document;
  }
}
