import HandlerDelegate from "./handler-delegate"

export default class ColumnDragHandler {

  protected handlerDelegate: HandlerDelegate

  constructor(handlerDelegate: HandlerDelegate) {
    this.handlerDelegate = handlerDelegate
  }


  /**
   * 处理鼠标移到列标题栏上方
   * - 缓存列标题栏拖动视图
   */
  private columnDragViewNode?: HTMLElement = undefined
  private columnDragViewIsMoveing = false
  private pageXOfColumnDragViewWhenMouseDown = -1        // 缓存开始拖动时的x轴数值
  private leftOfColumnDragViewWhenMouseDown = 0          // 缓存开始拖动时的left数值
  private dragColumnIndex = -1                           // 拖动所在列的序号
  private dragColumnWidth = -1                          // 拖动所在列的列宽              
  public handleMouseMoveAboveColumnDragView(canvasX: number) {
    if (this.columnDragViewIsMoveing) {
      return
    }

    // 特别约定处理：负数将节点隐藏
    if (canvasX < 0) {
      this.columnDragViewNode?.setStyle({ display: 'none' })
      this.columnDragViewNode = undefined
      return
    }

    const sheetViewDelegate = this.handlerDelegate.getSheetViewDelegate()

    // 缓存操作的节点, 点击事件的绑定
    if (!this.columnDragViewNode) {
      this.columnDragViewNode = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().columnDragConfig.viewElementId)!
    }

    // 通过canvasX的位置获取所在的列及列分割线的位置（列分割线左右2.5距离判断）
    const sheetStoreData = sheetViewDelegate.getCurrentSheetStore()
    let focusColumnIndex = -1
    let focusColumnSplitLineX = -1
    for (let columnIndexKey of Object.keys(sheetStoreData.columnTitleBarXValues).sort((a, b) => parseInt(a) - parseInt(b))) {
      let columnSplitLineX = sheetStoreData.columnTitleBarXValues[parseInt(columnIndexKey)]
      if (canvasX >= columnSplitLineX - 2.5 && canvasX <= columnSplitLineX + 2.5) {
        focusColumnIndex = parseInt(columnIndexKey)
        focusColumnSplitLineX = columnSplitLineX
        break
      }
      if (canvasX < columnSplitLineX) {
        break
      }
    }

    // 不在列分割线有效范围内，则隐藏节点
    if (focusColumnIndex < 0) {
      this.columnDragViewNode.setStyle({ display: 'none' })
      this.columnDragViewNode = undefined
      return
    }
    // 将列标题栏拖动的视图定位到列分割线上
    this.columnDragViewNode.setStyle({
      left: `${focusColumnSplitLineX + sheetViewDelegate.getRenderedRowTitleBarWidth() - 2.5}px`,
      display: 'block',
      height: `${sheetViewDelegate.getRenderedColumnTitleBarHeight() - 1}px`
    })

    /**
     * 列拖动视图的事件注册
     * - 记录要调整列的序号及列宽
     */
    this.columnDragViewNode.onmousedown = (event: MouseEvent) => {
      this.dragColumnIndex = focusColumnIndex
      this.dragColumnWidth = sheetViewDelegate.getColumnWidth(focusColumnIndex)
      this.handleColumnDragViewMouseDown(event)
    }
  }



  /**
  * 通过canvas的鼠标移动事件 - 处理列拖动视图的移动
  */
  public handleCanvasMouseMove(event: MouseEvent) {
    if (!this.columnDragViewIsMoveing || this.columnDragViewNode === undefined) {
      return
    }

    this.columnDragViewNode!.setStyle({
      left: `${this.leftOfColumnDragViewWhenMouseDown - this.getMouseDragDistance(event)}px`
    })
  }


  /**
   * 列拖动结束后的处理事件 - 清空注册的事件和视图隐藏
   * 调用这个函数有两个地方：
   * 1: 列拖动视图自身的mouseUp
   * 2: canvas视图的mouseUp
   */
  public handleColumnDragViewMouseUp(event: MouseEvent) {
    if (this.columnDragViewNode === undefined) {
      return
    }
    const sheetViewDelegate = this.handlerDelegate.getSheetViewDelegate()

    // 拖动结束了
    this.columnDragViewIsMoveing = false

    // 注销绑定的事件
    this.columnDragViewNode!.onmousedown = null
    this.columnDragViewNode!.onmouseup = null

    // 视图的隐藏
    this.columnDragViewNode!.setStyle({ display: 'none' })
    let columnDragLineViewNode = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().columnDragConfig.lienViewElementId)!
    columnDragLineViewNode.setStyle({ display: 'none' })

    // 调整列宽数据并刷新canvas - 列拖动视图的移动 - 计算列的最终高度
    let mouseDistanceX = this.getMouseDragDistance(event)
    let finalColumnWidth = this.dragColumnWidth - mouseDistanceX
    sheetViewDelegate.getStore().currentWorksheet.getColumn(this.dragColumnIndex + 1).width = finalColumnWidth
    sheetViewDelegate.renderWorkSheet(sheetViewDelegate.getStore().currentWorksheet)

    // 缓存数据的清除
    this.columnDragViewNode = undefined
    this.pageXOfColumnDragViewWhenMouseDown = -1
    this.leftOfColumnDragViewWhenMouseDown = 0
    this.dragColumnIndex = -1
  }


  /**
   * 计算列拖动后列宽的最终宽度
   * @param event 鼠标的最新位置
   * @returns 
   */
  private getMouseDragDistance(event: MouseEvent): number {
    const sheetViewDelegate = this.handlerDelegate.getSheetViewDelegate()

    // 列拖动视图的移动
    let mouseDistanceX = this.pageXOfColumnDragViewWhenMouseDown - event.pageX

    // 控制能缩短的最小宽度 - （列宽 - 配置的最小宽度）
    if (this.dragColumnWidth && mouseDistanceX && mouseDistanceX > (this.dragColumnWidth - sheetViewDelegate.getConfiguration().columnDragConfig.minWidth)) {
      mouseDistanceX = this.dragColumnWidth - sheetViewDelegate.getConfiguration().columnDragConfig.minWidth
    }

    return mouseDistanceX
  }


  /**
   * 列拖动视图鼠标点击后
   */
  private handleColumnDragViewMouseDown(event: MouseEvent) {
    const sheetViewDelegate = this.handlerDelegate.getSheetViewDelegate()

    // 注册onmouseup，已便结束拖动后清空注册的事件
    this.columnDragViewNode!.onmouseup = (event: MouseEvent) => {
      this.handleColumnDragViewMouseUp(event)
    }

    // 开始可以拖动视图了
    this.columnDragViewIsMoveing = true

    // 缓存开始移动的初始信息
    this.pageXOfColumnDragViewWhenMouseDown = event.pageX
    this.leftOfColumnDragViewWhenMouseDown = parseInt(this.columnDragViewNode!.style.left)

    // 对标线的显示
    let columnDragLineViewNode = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().columnDragConfig.lienViewElementId)!
    columnDragLineViewNode.setStyle({
      display: 'block',
      height: `${sheetViewDelegate.getCurrentSheetStore().sheetHeight + sheetViewDelegate.getRenderedColumnTitleBarHeight()}px`
    })
  }

}