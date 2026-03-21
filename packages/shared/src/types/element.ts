export type CanvasElementType = 'rectangle' | 'text';

export interface CanvasElementBase {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
}

export interface RectangleElement extends CanvasElementBase {
  type: 'rectangle';
  width: number;
  height: number;
}

export interface TextElement extends CanvasElementBase {
  type: 'text';
  text: string;
}

export type CanvasElement = RectangleElement | TextElement;
