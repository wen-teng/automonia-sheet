import SheetViewDelegate from "../../sheet-view-delegate";

export default interface HandlerDelegate {

  getSheetViewDelegate(): SheetViewDelegate

  getCanvasElement(): HTMLCanvasElement

  getCanvasContext(): CanvasRenderingContext2D
  
}