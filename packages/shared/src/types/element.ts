export type CanvasElementType = 'rectangle' | 'ellipse' | 'arrow' | 'text';

export interface CanvasElementBase {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
}

export interface ShapeStyle {
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
}

export interface RectangleElement extends CanvasElementBase, ShapeStyle {
  type: 'rectangle';
  width: number;
  height: number;
}

export interface EllipseElement extends CanvasElementBase, ShapeStyle {
  type: 'ellipse';
  width: number;
  height: number;
}

export interface ArrowElement extends CanvasElementBase, ShapeStyle {
  type: 'arrow';
  endX: number;
  endY: number;
}

export interface TextElement extends CanvasElementBase {
  type: 'text';
  text: string;
}

export type ShapeElement = RectangleElement | EllipseElement | ArrowElement;
export type CanvasElement = ShapeElement | TextElement;
