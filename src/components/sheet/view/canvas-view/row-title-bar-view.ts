import SheetViewDelegate from "../sheet-view-delegate"

export default class RowTitleBarView {

  private delegate: SheetViewDelegate
  private canvasContext: CanvasRenderingContext2D

  constructor(delegate: SheetViewDelegate, canvasContext: CanvasRenderingContext2D) {
    this.delegate = delegate
    this.canvasContext = canvasContext
  }

  render() {
    if (!this.delegate.getConfiguration().rowTitleBarVisible) {
      return
    }

    let startX = 0
    let startY = this.delegate.getRenderedColumnTitleBarHeight()

    for (let rowIndex = 0; rowIndex < this.delegate.getCurrentSheetStore().renderedRowAmount; rowIndex++) {
      let rowHeight = this.delegate.getStore().currentWorksheet.getRow(rowIndex + 1)?.height || this.delegate.getConfiguration().defaultRowHeight

      // 行标题栏的边框线绘制
      this.canvasContext.strokeStyle = this.delegate.getConfiguration().splitLineStrokeStyle
      this.canvasContext.strokeRect(startX, startY, this.delegate.getRenderedRowTitleBarWidth(), rowHeight)

      // 行标题栏的行标题文本绘制
      const rowTitleBarItemCenterX = startX + this.delegate.getRenderedRowTitleBarWidth() / 2
      const rowTitleBarItemCenterY = startY + rowHeight / 2
      this.canvasContext.textAlign = 'center'
      this.canvasContext.textBaseline = 'middle'
      this.canvasContext.fillStyle = 'black'
      this.canvasContext.fillText(`${rowIndex + 1}`, rowTitleBarItemCenterX, rowTitleBarItemCenterY)

      startY += rowHeight
    }
  }
}