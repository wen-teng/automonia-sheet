import HandlerDelegate from "./handler-delegate"

/**
 * 行拖动处理器
 * -行高
 */
export default class RowDragHandler {

  protected handlerDelegate: HandlerDelegate

  constructor(handlerDelegate: HandlerDelegate) {
    this.handlerDelegate = handlerDelegate
  }


  /**
   * 处理鼠标移到行标题栏上方
   * - 缓存行标题栏拖动视图
   */
  private rowDragViewNode?: HTMLElement = undefined
  private rowDragViewIsMoveing = false
  private pageYOfRowDragViewWhenMouseDown = -1        // 缓存开始拖动时的y轴数值
  private topOfRowDragViewWhenMouseDown = 0           // 缓存开始拖动时的top数值
  private dragRowIndex = -1                           // 拖动所在行的序号
  private dragRowHeight = -1                          // 拖动所在行的行高               
  public handleMouseMoveAboveRowDragView(canvasY: number) {
    if (this.rowDragViewIsMoveing) {
      return
    }

    // 特别约定处理：负数将节点隐藏
    if (canvasY < 0) {
      this.rowDragViewNode?.setStyle({ display: 'none' })
      this.rowDragViewNode = undefined
      return
    }

    const sheetViewDelegate = this.handlerDelegate.getSheetViewDelegate()

    // 缓存操作的节点, 点击事件的绑定
    if (!this.rowDragViewNode) {
      this.rowDragViewNode = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().rowDragConfig.viewElementId)!
    }

    // 通过canvasY的位置获取所在的行及行分割线的位置（行分割线上下2.5距离判断）
    const sheetStoreData = sheetViewDelegate.getCurrentSheetStore()
    let focusRowIndex = -1
    let focusRowSplitLineY = -1
    for (let rowIndexKey of Object.keys(sheetStoreData.rowTitleBarYValues).sort((a, b) => parseInt(a) - parseInt(b))) {
      let rowSplitLineY = sheetStoreData.rowTitleBarYValues[parseInt(rowIndexKey)]
      if (canvasY >= rowSplitLineY - 2.5 && canvasY <= rowSplitLineY + 2.5) {
        focusRowIndex = parseInt(rowIndexKey)
        focusRowSplitLineY = rowSplitLineY
        break
      }
      if (canvasY < rowSplitLineY) {
        break
      }
    }

    // 不在行分割线有效范围内，则隐藏节点
    if (focusRowIndex < 0) {
      this.rowDragViewNode.setStyle({ display: 'none' })
      this.rowDragViewNode = undefined
      return
    }
    // 将行标题栏拖动的视图定位到行分割线上
    this.rowDragViewNode.setStyle({
      top: `${focusRowSplitLineY + sheetViewDelegate.getRenderedColumnTitleBarHeight() - 2.5}px`,
      display: 'block',
      width: `${sheetViewDelegate.getRenderedRowTitleBarWidth() - 1}px`
    })

    /**
     * 行拖动视图的事件注册
     * - 记录要调整行的序号及行高
     */
    this.rowDragViewNode.onmousedown = (event: MouseEvent) => {
      this.dragRowIndex = focusRowIndex
      this.dragRowHeight = sheetViewDelegate.getRowHeight(focusRowIndex)
      this.handleRowDragViewMouseDown(event)
    }

  }



  /**
   * 通过canvas的鼠标移动事件 - 处理行拖动视图的移动
   */
  public handleCanvasMouseMove(event: MouseEvent) {
    if (!this.rowDragViewIsMoveing || this.rowDragViewNode === undefined) {
      return
    }

    this.rowDragViewNode!.setStyle({
      top: `${this.topOfRowDragViewWhenMouseDown - this.getMouseDragDistance(event)}px`
    })
  }



  /**
   * 行拖动结束后的处理事件 - 清空注册的事件和视图隐藏
   * 调用这个函数有两个地方：
   * 1: 行拖动视图自身的mouseUp
   * 2: canvas视图的mouseUp
   */
  public handleRowDragViewMouseUp(event: MouseEvent) {
    if (this.rowDragViewNode === undefined) {
      return
    }
    const sheetViewDelegate = this.handlerDelegate.getSheetViewDelegate()

    // 拖动结束了
    this.rowDragViewIsMoveing = false

    // 注销绑定的事件
    this.rowDragViewNode!.onmousedown = null
    this.rowDragViewNode!.onmouseup = null

    // 视图的隐藏
    this.rowDragViewNode!.setStyle({ display: 'none' })
    let rowDragLineViewNode = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().rowDragConfig.lienViewElementId)!
    rowDragLineViewNode.setStyle({ display: 'none' })

    // 调整行高数据并刷新canvas - 行拖动视图的移动 - 计算行的最终高度
    let mouseDistanceY = this.getMouseDragDistance(event)
    let finalRowHeight = this.dragRowHeight - mouseDistanceY
    sheetViewDelegate.getStore().currentWorksheet.getRow(this.dragRowIndex + 1).height = finalRowHeight
    sheetViewDelegate.renderWorkSheet(sheetViewDelegate.getStore().currentWorksheet)

    // 缓存数据的清除
    this.rowDragViewNode = undefined
    this.pageYOfRowDragViewWhenMouseDown = -1
    this.topOfRowDragViewWhenMouseDown = 0
    this.dragRowIndex = -1
  }


  /**
   * 计算行拖动后行高的最终高度
   * @param event 鼠标的最新位置
   * @returns 
   */
  private getMouseDragDistance(event: MouseEvent): number {
    const sheetViewDelegate = this.handlerDelegate.getSheetViewDelegate()

    // 行拖动视图的移动
    let mouseDistanceY = this.pageYOfRowDragViewWhenMouseDown - event.pageY

    // 控制能缩短的最小高度 - （行高 - 配置的最小高度）
    if (this.dragRowHeight && mouseDistanceY && mouseDistanceY > (this.dragRowHeight - sheetViewDelegate.getConfiguration().rowDragConfig.minHeight)) {
      mouseDistanceY = this.dragRowHeight - sheetViewDelegate.getConfiguration().rowDragConfig.minHeight
    }

    return mouseDistanceY
  }


  /**
   * 行拖动视图鼠标点击后
   */
  private handleRowDragViewMouseDown(event: MouseEvent) {
    const sheetViewDelegate = this.handlerDelegate.getSheetViewDelegate()

    // 注册onmouseup，已便结束拖动后清空注册的事件
    this.rowDragViewNode!.onmouseup = (event: MouseEvent) => {
      this.handleRowDragViewMouseUp(event)
    }

    // 开始可以拖动视图了
    this.rowDragViewIsMoveing = true

    // 缓存开始移动的初始信息
    this.pageYOfRowDragViewWhenMouseDown = event.pageY
    this.topOfRowDragViewWhenMouseDown = parseInt(this.rowDragViewNode!.style.top)

    // 对标线的显示
    let rowDragLineViewNode = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().rowDragConfig.lienViewElementId)!
    rowDragLineViewNode.setStyle({
      display: 'block',
      width: `${sheetViewDelegate.getCurrentSheetStore().sheetWidth + sheetViewDelegate.getRenderedRowTitleBarWidth()}px`
    })
  }


}