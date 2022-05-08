import './extension'
import Configuration from "./configuration";
import SheetDelegate from './sheet-delegate'
import SheetStore from "./store/sheet-store";
import Store from './store'
import { Workbook, Worksheet } from "exceljs";
import SheetView from "./view/sheet-view";
import SheetViewDelegate from "./view/sheet-view-delegate";
import EventHandler from './event-handler';
import EventHandlerDelegate from './event-handler/delegate';

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


  highlightRowTitleBarView(rowIndex: number): void {
    throw new Error('Method not implemented.');
  }
  cancelHighlightRowTitleBarView(): void {
    throw new Error('Method not implemented.');
  }
  highlightCell(rowIndex: number, columnIndex: number): void {
    throw new Error('Method not implemented.');
  }
  highlightRangeCell(startRowIndex: number, endRowIndex: number, startColumnIndex: number, endColumnIndex: number): void {
    throw new Error('Method not implemented.');
  }
  handleDocumentMouseUp(event: MouseEvent): void {
    throw new Error('Method not implemented.');
  }
  handleCanvasMouseMove(event: MouseEvent): void {
    throw new Error('Method not implemented.');
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

}