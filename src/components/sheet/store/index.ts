import { Workbook, Worksheet } from "exceljs"
import SheetStore from "./sheet-store"

export default class Store {

  // 当前工作簿的ID
  currentSheetId: number

  // 当前的工作簿对象
  currentWorksheet: Worksheet

  workbook: Workbook

  // id作为key，值存放工作表的缓存数据
  [key: number]: SheetStore;



  constructor(workbook: Workbook) {
    if (!workbook.worksheets || workbook.worksheets.length <= 0) {
      throw new Error('工作表内容为空')
    }

    this.workbook = workbook
    this.currentWorksheet = workbook.worksheets[0]
    this.currentSheetId = this.currentWorksheet.id

  }

}