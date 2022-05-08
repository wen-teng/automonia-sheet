import { Workbook } from "exceljs";
import EventHandler from "../event-handler";
import CanvasView from "./canvas-view/canvas-view";
import SheetViewDelegate from "./sheet-view-delegate";

export default class SheetView {

  private delegate: SheetViewDelegate
  private canvasView: CanvasView

  constructor(containerId: string, delegate: SheetViewDelegate) {
    this.delegate = delegate

    const containerNode = document.getElementById(containerId)!
    containerNode.style.position = 'relative'
    containerNode.innerHTML = `
      <div class="sheet-container-view">
        <div class="sheet-tool-bar-container-view" id="sheet-tool-bar-container-view"></div>
        <div class="sheet-canvas-container-view" id="sheet-canvas-container-view"></div>
        <div class="sheet-footer-bar-container-view" id="sheet-footer-bar-container-view"></div>
      </div>
    `

    this.canvasView = new CanvasView('sheet-canvas-container-view', this.delegate)
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


}