export interface PointerInput {
  pointerId: number;
  button: number;
  clientX: number;
  clientY: number;
  buttons: number;
  spaceKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  ctrlKey: boolean;
}

export interface WheelInput {
  clientX: number;
  clientY: number;
  deltaY: number;
  ctrlKey: boolean;
  metaKey: boolean;
}
