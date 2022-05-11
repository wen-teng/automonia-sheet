import sheetUtils from "../../utils/sheet-utils";
import SheetViewDelegate from "../sheet-view-delegate";
import ColumnDragHandler from "./handler/column-drag-handler";
import HandlerDelegate from "./handler/handler-delegate";
import RowDragHandler from "./handler/row-drag-handler";
import SingleSelectionHandler from "./handler/single-selection-handler";

export default class CanvasView implements HandlerDelegate {

  private delegate: SheetViewDelegate
  private canvasElement: HTMLCanvasElement
  private canvasContext: CanvasRenderingContext2D

  private singleSelectionHandler: SingleSelectionHandler
  private rowDragHandler: RowDragHandler
  private columnDragHandler: ColumnDragHandler


  constructor(delegate: SheetViewDelegate) {
    this.delegate = delegate

    this.canvasElement = this.delegate.getNode(this.delegate.getConfiguration().canvasElementId) as HTMLCanvasElement
    this.canvasContext = this.canvasElement.getContext('2d')!

    // 各种处理器创建
    this.singleSelectionHandler = new SingleSelectionHandler(this)
    this.rowDragHandler = new RowDragHandler(this)
    this.columnDragHandler = new ColumnDragHandler(this)
  }

  // 绘制
  renderCurrentWorksheet() {
    // 原canvas内容的清除
    this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height)

    /**
     * 使用工作簿的宽度和高度设置canvas的宽度和高度 
     * -（canvas实际大小多出一行一列, 如果显示行列标题栏则需加上其大小）
     * - canvas模糊问题的修复
     */
    const sheetStoreData = this.delegate.getCurrentSheetStore()

    let canvasWidth = sheetStoreData.sheetWidth + this.delegate.getConfiguration().defaultColumnWidth + this.delegate.getRenderedRowTitleBarWidth()
    let canvasHeight = sheetStoreData.sheetHeight + this.delegate.getConfiguration().defaultRowHeight + this.delegate.getRenderedColumnTitleBarHeight()
    this.canvasElement.setAttribute('width', String(canvasWidth * window.devicePixelRatio))
    this.canvasElement.setAttribute('height', String(canvasHeight * window.devicePixelRatio))
    this.canvasElement.setStyle({
      width: `${canvasWidth}px`,
      height: `${canvasHeight}px`
    })
    this.canvasElement.style.width = `${canvasWidth}px`
    this.canvasElement.style.height = `${canvasHeight}px`
    this.canvasContext.scale(window.devicePixelRatio, window.devicePixelRatio)


    /**
     * 绘制全选单元格
     * 绘制行标题栏
     * 绘制列标题栏
     */
    this.renderRowTitleBarView()
    this.renderColumnTitleBarView()
    this.renderSelectAllCellView()

    // -
    this.renderCellSplitLineView()
  }

  ///////////////////////////////////////////////////////////////////////
  // 处理器代理

  getSheetViewDelegate(): SheetViewDelegate {
    return this.delegate
  }
  getCanvasElement(): HTMLCanvasElement {
    return this.canvasElement
  }
  getCanvasContext(): CanvasRenderingContext2D {
    return this.canvasContext
  }

  ///////////////////////////////////////////////////////////////////////

  /**
   * 高亮单个单元格
   * @param rowIndex 行
   * @param columnIndex 列 
   */
  public highlightCell(rowIndex: number, columnIndex: number) {
    this.singleSelectionHandler.highlightCell(rowIndex, columnIndex)
  }

  public highlightColumn(columnIndex: number) {
    let totalRowAmount = this.delegate.getCurrentSheetStore().renderedRowAmount
    this.highlightRangeCell(0, totalRowAmount - 1, columnIndex, columnIndex)
  }

  public highlightRow(rowIndex: number) {
    let totalColumnAmount = this.delegate.getCurrentSheetStore().renderedColumnAmount
    this.highlightRangeCell(rowIndex, rowIndex, 0, totalColumnAmount - 1)
  }

  public highlightRangeCell(startRowIndex: number, endRowIndex: number, startColumnIndex: number, endColumnIndex: number) {
    this.singleSelectionHandler.highlightRangeCell(startRowIndex, endRowIndex, startColumnIndex, endColumnIndex)
  }

  public handleMouseMoveAboveRowDragView(canvasY: number) {
    this.rowDragHandler.handleMouseMoveAboveRowDragView(canvasY)
  }

  public handleMouseMoveAboveColumnDragView(canvasX: number) {
    this.columnDragHandler.handleMouseMoveAboveColumnDragView(canvasX)
  }

  public handleDocumentMouseUp(event: MouseEvent) {
    this.rowDragHandler.handleRowDragViewMouseUp(event)
    this.columnDragHandler.handleColumnDragViewMouseUp(event)
  }

  public handleCanvasMouseMove(event: MouseEvent) {
    this.rowDragHandler.handleCanvasMouseMove(event)
    this.columnDragHandler.handleCanvasMouseMove(event)
  }

  private renderSelectAllCellView() {
    // 当行标题栏 或者 列标题栏 存在一个绘制前提下，即绘制全选单元格
    if (!this.delegate.getConfiguration().rowTitleBarVisible && !this.delegate.getConfiguration().columnBarTitleVisible) {
      return
    }

    // 全选单元格
    const cellX = 0
    const cellY = 0
    const cellWidth = this.delegate.getRenderedRowTitleBarWidth()
    const cellHeight = this.delegate.getRenderedColumnTitleBarHeight()
    // 全选单元格 - 内的三角形与边界的距离
    const triangleIntervalSpece = this.delegate.getConfiguration().selectAllCellConfig.triangleIntervalSpace
    this.canvasContext.strokeStyle = this.delegate.getConfiguration().splitLineStrokeStyle
    this.canvasContext.lineWidth = 1
    this.canvasContext.strokeRect(cellX, cellY, cellWidth, cellHeight)

    // 全选单元格的三角形
    const triangleSideLength = this.delegate.getRenderedColumnTitleBarHeight() - triangleIntervalSpece * 2
    this.canvasContext.beginPath()
    // 直角的位置
    this.canvasContext.moveTo(this.delegate.getRenderedRowTitleBarWidth() - triangleIntervalSpece, this.delegate.getRenderedColumnTitleBarHeight() - triangleIntervalSpece)
    // 直角上边的角的位置
    this.canvasContext.lineTo(this.delegate.getRenderedRowTitleBarWidth() - triangleIntervalSpece, this.delegate.getRenderedColumnTitleBarHeight() - triangleIntervalSpece - triangleSideLength)
    // 直角左边的角的位置
    this.canvasContext.lineTo(this.delegate.getRenderedRowTitleBarWidth() - triangleIntervalSpece - triangleSideLength, this.delegate.getRenderedColumnTitleBarHeight() - triangleIntervalSpece)
    this.canvasContext.fillStyle = this.delegate.getConfiguration().selectAllCellConfig.triangleFillStyle
    this.canvasContext.lineWidth = 1
    this.canvasContext.fill()
  }

  private renderRowTitleBarView() {
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

  private renderColumnTitleBarView() {
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

  /**
   * 绘制网格线 - 暂不考虑单元格合并的事宜
   */
  private renderCellSplitLineView() {
    const sheetStoreData = this.delegate.getCurrentSheetStore()
    let startX = 0
    let startY = 0

    // 行分割线的绘制
    startX = this.delegate.getRenderedRowTitleBarWidth()
    startY = this.delegate.getRenderedColumnTitleBarHeight()
    for (let rowIndex = 0; rowIndex < sheetStoreData.renderedRowAmount; rowIndex++) {
      let rowHeight = this.delegate.getStore().currentWorksheet.getRow(rowIndex + 1)?.height || this.delegate.getConfiguration().defaultRowHeight
      startY += rowHeight
      this.canvasContext.beginPath()
      this.canvasContext.moveTo(startX, startY)
      this.canvasContext.lineTo(sheetStoreData.sheetWidth + this.delegate.getRenderedRowTitleBarWidth(), startY)
      this.canvasContext.strokeStyle = this.delegate.getConfiguration().splitLineStrokeStyle
      this.canvasContext.stroke()
    }

    // 列分割线的绘制
    startX = this.delegate.getRenderedRowTitleBarWidth()
    startY = this.delegate.getRenderedColumnTitleBarHeight()
    for (let columnIndex = 0; columnIndex < sheetStoreData.renderedColumnAmount; columnIndex++) {
      let columnWidth = this.delegate.getStore().currentWorksheet.getColumn(columnIndex + 1)?.width || this.delegate.getConfiguration().defaultColumnWidth
      startX += columnWidth
      this.canvasContext.beginPath()
      this.canvasContext.moveTo(startX, startY)
      this.canvasContext.lineTo(startX, sheetStoreData.sheetHeight + this.delegate.getRenderedColumnTitleBarHeight())
      this.canvasContext.strokeStyle = this.delegate.getConfiguration().splitLineStrokeStyle
      this.canvasContext.stroke()
    }

  }

}