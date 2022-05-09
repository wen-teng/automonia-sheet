import SelectionRangeCell from "./selection-range-cell"

export default interface SheetStore {

  // 当前选择的行序号
  currentSelectRowIndex?: number

  // 当前选择的列序号
  currentSelectColumnIndex?: number

  // 当前选择的范围单元格集合
  currentSelectionRangeCell?: SelectionRangeCell


  //////////////////////////////////////////////////////
  

  // 工作簿的宽度
  sheetWidth: number

  // 工作簿的高度
  sheetHeight: number

  // 行标题栏的Y轴坐标数值（下边的坐标为准）
  rowTitleBarYValues: { [key: string]: number }

  // 列标题栏的X轴坐标数值（右边的坐标为准）
  columnTitleBarXValues: { [key: string]: number }

  // 已经渲染了的行数
  renderedRowAmount: number

  // 已经渲染了的列数
  renderedColumnAmount: number

}