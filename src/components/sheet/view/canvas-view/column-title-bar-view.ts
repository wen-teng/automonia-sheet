import sheetUtils from "../../utils/sheet-utils"
import SheetViewDelegate from "../sheet-view-delegate"

export default class ColumnTitleBarView {

  private delegate: SheetViewDelegate
  private canvasContext: CanvasRenderingContext2D

  constructor(delegate: SheetViewDelegate, canvasContext: CanvasRenderingContext2D) {
    this.delegate = delegate
    this.canvasContext = canvasContext
  }

  render() {
    if (!this.delegate.getConfiguration().columnBarTitleVisible) {
      return
    }

    let startX = this.delegate.getRenderedRowTitleBarWidth()
    let startY = 0

    for (let columnIndex = 0; columnIndex < this.delegate.getCurrentSheetStore().renderedColumnAmount; columnIndex++) {
      let columnWidth = this.delegate.getStore().currentWorksheet.getColumn(columnIndex + 1)?.width || this.delegate.getConfiguration().defaultColumnWidth

      // 列标题栏的边框线绘制
      this.canvasContext.strokeStyle = this.delegate.getConfiguration().splitLineStrokeStyle
      this.canvasContext.strokeRect(startX, startY, columnWidth, this.delegate.getRenderedColumnTitleBarHeight())

      // 列标题栏的列标题文本绘制
      const columnTitleBarItemCenterX = startX + columnWidth / 2
      const columnTitleBarItemCenterY = startY + this.delegate.getRenderedColumnTitleBarHeight() / 2
      this.canvasContext.textAlign = 'center'
      this.canvasContext.textBaseline = 'middle'
      this.canvasContext.fillStyle = 'black'
      this.canvasContext.fillText(`${sheetUtils.getColumnTitleFromIndex(columnIndex)}`, columnTitleBarItemCenterX, columnTitleBarItemCenterY)

      startX += columnWidth
    }
  }
}