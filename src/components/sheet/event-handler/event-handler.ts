import EventHandlerDelegate from "./event-handler-delegate";
import KeyboardKeys from "./keyboard-keys";


/**
 * 
 * 键盘-鼠标的事件处理器
 * --
 * 主要针对document和canvas的
 * 
 */
export default class EventHandler {

  private delegate: EventHandlerDelegate
  private canvasElement: HTMLCanvasElement

  constructor(delegate: EventHandlerDelegate) {
    this.delegate = delegate

    // 
    let canvasNode = this.delegate.getNode(this.delegate.getConfiguration().canvasElementId) as HTMLCanvasElement
    if (canvasNode === null) {
      throw new Error('canvas节点不存在 - KeywordMouseEventHandler')
    }
    this.canvasElement = canvasNode

    // 
    this.canvasElement.onclick = (event: MouseEvent) => {
      this.handleCanvasElementClick(event)
    }
    document.onkeydown = (event: KeyboardEvent) => {
      this.handleDocumentElementKeyDown(event)
    }
    document.onkeyup = (event: KeyboardEvent) => {
      this.handleDocumentElementKeyUp(event)
    }
    document.onmouseup = (event: MouseEvent) => {
      this.handleDocumentElementMouseUp(event)
    }
    this.canvasElement.onmousemove = (event: MouseEvent) => {
      this.handleCanvasElementMouseMove(event)
    }
  }


  ///////////////////////////////////////////////////////////////////////
  // 缓存已经按下的键的信息
  private cacheTouchedKey: { [key: string]: boolean } = {}


  private handleCanvasElementMouseMove(event: MouseEvent) {
    this.delegate.handleCanvasMouseMove(event)

    let pageX = event.pageX
    let pageY = event.pageY
    let canvasClientRect = this.canvasElement.getBoundingClientRect()

    /**
     * 高亮行标题栏拖动视图
     * 判断条件：如果行标题栏显示并pageX在标题栏上
     */
    if (
      this.delegate.getConfiguration().rowTitleBarVisible
      && pageX - canvasClientRect.left >= 0
      && pageX - canvasClientRect.left <= this.delegate.getRenderedRowTitleBarWidth()
    ) {
      let canvasY = pageY - canvasClientRect.top - this.delegate.getRenderedColumnTitleBarHeight()
      this.delegate.handleMouseMoveAboveRowDragView(canvasY)
    } else {
      this.delegate.handleMouseMoveAboveRowDragView(-1)
    }

  }

  private handleDocumentElementMouseUp(event: MouseEvent) {
    this.delegate.handleDocumentMouseUp(event)
  }

  private handleCanvasElementClick(event: MouseEvent) {
    let { rowIndex, columnIndex } = this.getRowColumnIndexByPageXY(event.pageX, event.pageY)
    if (rowIndex < 0 || columnIndex < 0) {
      return
    }
    const sheetStoreData = this.delegate.getCurrentSheetStore()

    // shift + 点击：范围单元格的处理（前提：已经存在一个高亮的单元格）
    if (
      this.cacheTouchedKey[KeyboardKeys.shift] &&
      sheetStoreData.currentSelectColumnIndex !== undefined &&
      sheetStoreData.currentSelectRowIndex !== undefined
    ) {
      this.delegate.highlightRangeCell(sheetStoreData.currentSelectRowIndex, rowIndex, sheetStoreData.currentSelectColumnIndex, columnIndex)
      return
    }

    // 高亮单元格
    this.delegate.highlightCell(rowIndex, columnIndex)
  }

  private handleDocumentElementKeyDown(event: KeyboardEvent) {
    this.handleCacheTouchedKeys(event)
  }

  private handleDocumentElementKeyUp(event: KeyboardEvent) {
    this.handleCacheTouchedKeys(event)
  }


  ///////////////////////////////////////////////////////////////////////
  // 
  private handleCacheTouchedKeys(event: KeyboardEvent) {
    this.cacheTouchedKey[KeyboardKeys.shift] = event.shiftKey
    this.cacheTouchedKey[KeyboardKeys.ctrl] = event.ctrlKey
    this.cacheTouchedKey[KeyboardKeys.meta] = event.metaKey
  }


  /**
   * 通过鼠标在canvas点击的event对象解析出所在的行-列
   * @param pageX event相对于文档的x值
   * @param pageY event相对于文档的y值
   * @returns 
   */
  private getRowColumnIndexByPageXY(pageX: number, pageY: number): { rowIndex: number, columnIndex: number } {
    let canvasClientRect = this.canvasElement.getBoundingClientRect()
    const sheetStoreData = this.delegate.getCurrentSheetStore()

    // 点击列的确定
    let columnIndex = -1
    let canvasX = pageX - canvasClientRect.left - this.delegate.getRenderedColumnTitleBarHeight()
    if (canvasX >= 0) {
      for (let columnIndexKey of Object.keys(sheetStoreData.columnTitleBarXValues).sort((a, b) => parseInt(a) - parseInt(b))) {
        let columnSplitLineX = sheetStoreData.columnTitleBarXValues[parseInt(columnIndexKey)]
        if (canvasX < columnSplitLineX) {
          columnIndex = Number.parseInt(columnIndexKey)
          break
        }
      }
    }

    // 点击行的确定
    let rowIndex = -1
    let canvasY = pageY - canvasClientRect.top - this.delegate.getRenderedColumnTitleBarHeight()
    if (canvasY >= 0) {
      for (let rowIndexKey of Object.keys(sheetStoreData.rowTitleBarYValues).sort((a, b) => parseInt(a) - parseInt(b))) {
        let rowSplitLineY = sheetStoreData.rowTitleBarYValues[parseInt(rowIndexKey)]
        if (canvasY < rowSplitLineY) {
          rowIndex = Number.parseInt(rowIndexKey)
          break
        }
      }
    }

    return { rowIndex, columnIndex }
  }
}