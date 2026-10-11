export type TouchAction =
  | { type: 'MoveLeft' }
  | { type: 'MoveRight' }
  | { type: 'Jump' }
  | { type: 'Drag'; deltaXPx: number };

export class TouchControlHandler {
  private startX = 0;
  private startY = 0;
  private accumX = 0;
  private accumY = 0;
  private isDragging = false;

  constructor(
    private readonly horizontalSwipeThresholdPx = 45,
    private readonly verticalSwipeThresholdPx = 45,
    private readonly dragSensitivity = 1.0
  ) {}

  public onDragStart(x: number, y: number): void {
    this.startX = x;
    this.startY = y;
    this.accumX = 0;
    this.accumY = 0;
    this.isDragging = true;
  }

  public onDrag(deltaX: number, deltaY: number): TouchAction | null {
    this.accumX += deltaX;
    this.accumY += deltaY;

    const isPrimarilyHorizontal = Math.abs(this.accumX) > Math.abs(this.accumY);
    if (isPrimarilyHorizontal && Math.abs(this.accumX) >= 4) {
      return { type: 'Drag', deltaXPx: deltaX * this.dragSensitivity };
    }
    return null;
  }

  public onDragEnd(): TouchAction | null {
    this.isDragging = false;
    const absX = Math.abs(this.accumX);
    const absY = Math.abs(this.accumY);

    // Swipe up (accumY < 0) priority when vertical axis dominates
    if (absY > absX && absY >= this.verticalSwipeThresholdPx && this.accumY < 0) {
      return { type: 'Jump' };
    }

    // Horizontal swipe
    if (absX > absY && absX >= this.horizontalSwipeThresholdPx) {
      return this.accumX < 0 ? { type: 'MoveLeft' } : { type: 'MoveRight' };
    }

    return null;
  }

  public onTap(xFractionOfWidth: number): TouchAction {
    if (xFractionOfWidth < 0.33) {
      return { type: 'MoveLeft' };
    }
    if (xFractionOfWidth > 0.67) {
      return { type: 'MoveRight' };
    }
    return { type: 'Jump' };
  }
}
