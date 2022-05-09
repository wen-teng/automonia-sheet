import { Workbook } from "exceljs";
import EventHandler from "../event-handler";
import CanvasView from "./canvas-view/canvas-view";
import SheetViewDelegate from "./sheet-view-delegate";

export default class SheetView {

  private delegate: SheetViewDelegate
  private canvasView: CanvasView

  constructor(containerId: string, delegate: SheetViewDelegate) {
    this.delegate = delegate

    // 将容器节点设置为相对定位，保证内部视图的定位
    const containerNode = document.getElementById(containerId)!
    containerNode.style.position = 'relative'

    // 获取视图的配置信息
    const singleSelectionConfig = this.delegate.getConfiguration().singleSelectionConfig

    containerNode.innerHTML = `
      <div class="sheet-container-view">
        <div class="sheet-tool-bar-container-view" id="sheet-tool-bar-container-view"></div>
        <div class="sheet-canvas-container-view" id="sheet-canvas-container-view">
          <canvas id="${delegate.getConfiguration().canvasElementId}"></canvas>

          <!-- 单选（单个单元格,一个范围的单元格(聚集一个,其他border-width覆盖)) -->
          <div class="sheet-single-container-view">
            <div class="sheet-single-selection-view" id="${singleSelectionConfig.viewElementId}">
              <div class="sheet-single-selection-dot-view" id="${singleSelectionConfig.dotViewElementId}"></div>
            </div>
            <div class="sheet-single-selection-row-line-view" id="${singleSelectionConfig.rowLineViewElementId}"></div>
            <div class="sheet-single-selection-column-line-view" id="${singleSelectionConfig.columnLineViewElementId}"></div>
            <div class="sheet-single-selection-row-range-view" id="${singleSelectionConfig.rowRangeViewElementId}"></div>
            <div class="sheet-single-selection-column-range-view" id="${singleSelectionConfig.columnRangeViewElementId}"></div>
          </div>
        </div>
        <div class="sheet-footer-bar-container-view" id="sheet-footer-bar-container-view"></div>
      </div>
    `

    this.canvasView = new CanvasView(this.delegate)
  }


  /**
   * 初始化表单
   * 
   * 底部工作栏的工作簿标题选项的绘制
   */
  initialSheetView() {

  }

  renderCurrentWorksheet() {
    this.canvasView.renderCurrentWorksheet()
  }

  // 高亮单元格
  highlightCell(rowIndex: number, columnIndex: number) {
    this.canvasView.highlightCell(rowIndex, columnIndex)
  }

  highlightRangeCell(startRowIndex: number, endRowIndex: number, startColumnIndex: number, endColumnIndex: number) {
    this.canvasView.highlightRangeCell(startRowIndex, endRowIndex, startColumnIndex, endColumnIndex)
  }

}