import SheetViewDelegate from "../sheet-view-delegate"

export default class SelectAllCellView {

  private delegate: SheetViewDelegate
  private canvasContext: CanvasRenderingContext2D

  constructor(delegate: SheetViewDelegate, canvasContext: CanvasRenderingContext2D) {
    this.delegate = delegate
    this.canvasContext = canvasContext
  }

  render() {
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

}