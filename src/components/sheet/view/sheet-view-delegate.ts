import { Worksheet } from "exceljs";
import SheetDelegate from "../sheet-delegate";

export default interface SheetViewDelegate extends SheetDelegate {

  /**
   * 获取单元格大小
   * @param rowIndex 
   * @param columnIndex 
   * @returns 
   */
  getCellSize(rowIndex: number, columnIndex: number): { width: number, height: number }

  getColumnWidth(columnIndex: number): number

  getRowHeight(rowIndex: number): number


  /**
   * 验证行-列参数是否有效
   * @param rowIndex 
   * @param columnIndex 
   */
  validateRowColumnIndex(rowIndex: number, columnIndex: number): boolean


  /**
   * 渲染工作表
   * @param worksheet 工作表数据对象
   */
  renderWorkSheet(worksheet: Worksheet): void

}