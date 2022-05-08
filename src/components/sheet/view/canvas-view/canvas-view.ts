import { Worksheet } from "exceljs";
import sheetUtils from "../../utils/sheet-utils";
import SheetViewDelegate from "../sheet-view-delegate";
import ColumnTitleBarView from "./column-title-bar-view";
import RowTitleBarView from "./row-title-bar-view";
import SelectAllCellView from "./select-all-cell-view";

export default class CanvasView {

  private delegate: SheetViewDelegate
  private canvasElement: HTMLCanvasElement
  private canvasContext: CanvasRenderingContext2D
  private rowTitleBarView: RowTitleBarView
  private columnTitleBarView: ColumnTitleBarView
  private selectAllCellView: SelectAllCellView


  constructor(canvasContainerId: string, delegate: SheetViewDelegate) {
    let canvasContainerNode = delegate.getNode(canvasContainerId)
    if (!canvasContainerNode) {
      throw new Error('canvas容器节点不存在')
    }

    this.delegate = delegate
    canvasContainerNode.innerHTML = `
      <canvas id="${delegate.getConfiguration().canvasElementId}"></canvas>

      <!-- 单选单元格 -->
    `

    this.canvasElement = this.delegate.getNode(this.delegate.getConfiguration().canvasElementId) as HTMLCanvasElement
    this.canvasContext = this.canvasElement.getContext('2d')!

    // -
    this.rowTitleBarView = new RowTitleBarView(this.delegate, this.canvasContext)
    this.columnTitleBarView = new ColumnTitleBarView(this.delegate, this.canvasContext)
    this.selectAllCellView = new SelectAllCellView(this.delegate, this.canvasContext)
  }

  // 绘制
  renderCurrentWorksheet() {
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
    this.rowTitleBarView.render()
    this.columnTitleBarView.render()
    this.selectAllCellView.render()

    // -
    this.renderCellSplitLineView()
  }

  ///////////////////////////////////////////////////////////////////////


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