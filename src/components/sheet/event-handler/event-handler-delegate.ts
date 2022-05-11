import KeywordMouseEventHandler from "./event-handler"
import SheetDelegate from "../sheet-delegate"

export default interface EventHandlerDelegate extends SheetDelegate {

  /**
   * 处理鼠标移动到行拖动视图上方
   * @param canvasY 在canvas上的y坐标
   */
  handleMouseMoveAboveRowDragView(canvasY: number): void


  /**
   * 处理鼠标移动到列拖动视图上方
   * @param canvasX  在canvas上x坐标
   */
  handleMouseMoveAboveColumnDragView(canvasX: number): void

  // /**
  //  * 取消行标题栏的高亮
  //  */
  // cancelHighlightRowTitleBarView(): void

  /**
   * 单元格的高亮
   * @param rowIndex 行序号
   * @param columnIndex 列序号
   */
  highlightCell(rowIndex: number, columnIndex: number): void

  /**
   * 范围单元格的高亮
   * @param startRowIndex 开始位置的行序号
   * @param endRowIndex 结束位置的行序号
   * @param startColumnIndex 开始位置的列序号
   * @param endColumnIndex 结束位置的列序号
   */
  highlightRangeCell(startRowIndex: number, endRowIndex: number, startColumnIndex: number, endColumnIndex: number): void

  /**
   * 处理document的mouseup事件
   * @param event 事件对象
   */
  handleDocumentMouseUp(event: MouseEvent): void

  /**
   * 处理canvas的mousemove事件
   * @param event 事件对象
   */
  handleCanvasMouseMove(event: MouseEvent): void

}