import './extension'
import Configuration from "./configuration";
import SheetStore from "./store/sheet-store";
import Store from './store'
import { Workbook, Worksheet } from "exceljs";
import SheetView from "./view/sheet-view";
import SheetViewDelegate from "./view/sheet-view-delegate";
import EventHandler from './event-handler/event-handler';
import EventHandlerDelegate from './event-handler/event-handler-delegate';

/**
 * 表单对象
 */
export default class Sheet implements EventHandlerDelegate, SheetViewDelegate {

  private containerId: string
  private configuration: Configuration
  private store: Store
  private workbook: Workbook
  private sheetView: SheetView
  private eventHandler: EventHandler


  constructor(containerId: string) {
    if (!document.getElementById(containerId)) {
      throw new Error("容器节点不存在")
    }
    this.containerId = containerId

    /**
     * E1：先创建空的工作簿
     * E2：创建配置-缓存的资源
     * E3：初始化工作表
     * E4：渲染工作簿
     * E5：注册事件处理器
     */
    // -
    this.workbook = new Workbook()
    this.workbook.addWorksheet('automonia-sheet')

    // -
    this.store = new Store(this.workbook)
    this.configuration = new Configuration(containerId)

    // -
    this.sheetView = new SheetView(containerId, this)
    this.sheetView.initialSheetView()

    // -
    this.renderWorkSheet(this.getStore().currentWorksheet)

    // -
    this.eventHandler = new EventHandler(this)
  }


  /**
   * 渲染工作表
   * @param workSheet 工作表对象
   */
  renderWorkSheet(worksheet: Worksheet) {
    this.store.currentSheetId = worksheet.id
    this.store.currentWorksheet = worksheet

    // 工作簿高度的计算（不含列标题栏的高度）-每行分割线位置的计算
    let rowTitleBarYValues: { [key: string]: number } = {}
    let sheetHeight = 0
    let renderedRowAmount = 0
    for (let rowIndex = 0; rowIndex < this.configuration.rowAmountOfEmptySheet; rowIndex++) {
      let rowHeight = worksheet.getRow(rowIndex + 1)?.height || this.configuration.defaultRowHeight
      sheetHeight += rowHeight
      rowTitleBarYValues[rowIndex] = sheetHeight
    }
    sheetHeight = sheetHeight
    renderedRowAmount = this.configuration.rowAmountOfEmptySheet

    // 工作簿宽度的计算（不含行标题栏的宽度） - 每列分割线位置的计算
    let columnTitleBarXValues: { [key: string]: number } = {}
    let sheetWidth = 0
    let renderedColumnAmount = 0
    for (let columnIndex = 0; columnIndex < this.configuration.columnAmountOfEmptySheet; columnIndex++) {
      let columnWidth = worksheet.getColumn(columnIndex + 1)?.width || this.configuration.defaultColumnWidth
      sheetWidth += columnWidth
      columnTitleBarXValues[columnIndex] = sheetWidth
    }
    sheetWidth = sheetWidth
    renderedColumnAmount = this.configuration.columnAmountOfEmptySheet

    // 当前工作簿的缓存数据
    this.store[this.store.currentSheetId] = {
      sheetWidth,
      sheetHeight,
      rowTitleBarYValues,
      columnTitleBarXValues,
      renderedRowAmount,
      renderedColumnAmount
    }

    this.sheetView.renderCurrentWorksheet()
  }

  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////



  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////

  handleCanvasMouseMove(event: MouseEvent) {
    this.sheetView.handleCanvasMouseMove(event)
  }

  handleDocumentMouseUp(event: MouseEvent) {
    this.sheetView.handleDocumentMouseUp(event)
  }

  handleMouseMoveAboveRowDragView(canvasY: number) {
    this.sheetView.handleMouseMoveAboveRowDragView(canvasY)
  }

  highlightCell(rowIndex: number, columnIndex: number): void {
    if (!this.validateRowColumnIndex(rowIndex, columnIndex)) {
      throw new Error(`行-列参数无效，非渲染行列数范围内，行${rowIndex}-${columnIndex}`)
    }

    // 缓存数据
    const sheetStoreData = this.getCurrentSheetStore()
    sheetStoreData.currentSelectRowIndex = rowIndex
    sheetStoreData.currentSelectColumnIndex = columnIndex

    this.sheetView.highlightCell(rowIndex, columnIndex)
  }

  highlightRangeCell(startRowIndex: number, endRowIndex: number, startColumnIndex: number, endColumnIndex: number): void {
    if (!this.validateRowColumnIndex(startRowIndex, startColumnIndex)) {
      throw new Error(`行-列参数无效，非渲染行列数范围内，行${startRowIndex}-${startColumnIndex}`)
    }
    if (!this.validateRowColumnIndex(endRowIndex, endColumnIndex)) {
      throw new Error(`行-列参数无效，非渲染行列数范围内，行${endRowIndex}-${endColumnIndex}`)
    }

    // 缓存数据
    const sheetStoreData = this.getCurrentSheetStore()
    sheetStoreData.currentSelectRowIndex = startRowIndex
    sheetStoreData.currentSelectColumnIndex = startColumnIndex
    sheetStoreData.currentSelectionRangeCell = {
      startRowIndex,
      endRowIndex,
      startColumnIndex,
      endColumnIndex
    }

    this.sheetView.highlightRangeCell(startRowIndex, endRowIndex, startColumnIndex, endColumnIndex)
  }


  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////


  getNode(nodeId: string): HTMLElement | null {
    return document.querySelector(`#${this.containerId} #${nodeId}`)
  }

  getStore(): Store {
    return this.store
  }

  getConfiguration(): Configuration {
    return this.configuration
  }

  getCurrentSheetStore(): SheetStore {
    return this.store[this.store.currentSheetId]
  }
  getRenderedRowTitleBarWidth(): number {
    return this.configuration.rowTitleBarVisible ? this.configuration.rowTitleBarWidth : 0
  }
  getRenderedColumnTitleBarHeight(): number {
    return this.configuration.columnBarTitleVisible ? this.configuration.columnTitleBarHeight : 0
  }


  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////

  /**
   * 行-列参数有效性判断
   * @param rowIndex 行参数
   * @param columnIndex  列参数
   * @returns true - 行列都有效，false - 行列都无效
   */
  public validateRowColumnIndex(rowIndex: number, columnIndex: number): boolean {
    const sheetStoreData = this.getCurrentSheetStore()
    if (rowIndex < 0 || rowIndex > sheetStoreData.renderedRowAmount) {
      // throw new Error(`行序号参数无效，${rowIndex}不在0-${sheetStoreData.renderedRowAmount}范围内`)
      return false
    }
    if (columnIndex < 0 || columnIndex > sheetStoreData.renderedColumnAmount) {
      // throw new Error(`列序号参数无效，${columnIndex}不在0-${sheetStoreData.renderedColumnAmount}范围内`)
      return false
    }
    return true
  }

  /**
   * 
   * @param rowIndex 
   * @param columnIndex 
   * @returns 
   */
  public getCellSize(rowIndex: number, columnIndex: number): { width: number, height: number } {
    if (!this.validateRowColumnIndex(rowIndex, columnIndex)) {
      throw new Error(`行-列参数无效，非渲染行列数范围内，行${rowIndex}-列${columnIndex}`)
    }

    let worksheet = this.getStore().currentWorksheet
    if (!worksheet) {
      throw new Error(`当前工作表不存在`)
    }

    // 所在行的行高即单元格的高度
    let rowHeight: number = 0
    if (rowIndex !== undefined) {
      rowHeight = worksheet.getRow(rowIndex + 1)?.height || this.getConfiguration().defaultRowHeight
    }
    // 所在列的列宽即单元格的宽度
    let columnWidth: number = 0
    if (columnIndex !== undefined) {
      columnWidth = worksheet.getColumn(columnIndex + 1)?.width || this.getConfiguration().defaultColumnWidth
    }

    return {
      width: columnWidth,
      height: rowHeight
    }
  }

  public getRowHeight(rowIndex: number): number {
    if (!this.validateRowColumnIndex(rowIndex, 0)) {
      throw new Error(`行参数无效，非渲染行列数范围内，行${rowIndex}`)
    }

    let worksheet = this.getStore().currentWorksheet
    if (!worksheet) {
      throw new Error(`当前工作表不存在`)
    }

    // 所在行的行高即单元格的高度
    let rowHeight: number = 0
    if (rowIndex !== undefined) {
      rowHeight = worksheet.getRow(rowIndex + 1)?.height || this.getConfiguration().defaultRowHeight
    }

    return rowHeight
  }

  public getColumnWidth(columnIndex: number): number {
    if (!this.validateRowColumnIndex(0, columnIndex)) {
      throw new Error(`列参数无效，非渲染行列数范围内，列${columnIndex}`)
    }

    let worksheet = this.getStore().currentWorksheet
    if (!worksheet) {
      throw new Error(`当前工作表不存在`)
    }

    // 所在列的列宽即单元格的宽度
    let columnWidth: number = 0
    if (columnIndex !== undefined) {
      columnWidth = worksheet.getColumn(columnIndex + 1)?.width || this.getConfiguration().defaultColumnWidth
    }

    return columnWidth
  }

}