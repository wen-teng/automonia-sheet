import HandlerDelegate from "./handler-delegate";

export default class SingleSelectionHandler {

  protected handlerDelegate: HandlerDelegate

  constructor(handlerDelegate: HandlerDelegate) {
    this.handlerDelegate = handlerDelegate
  }


  public highlightRangeCell(startRowIndex: number, endRowIndex: number, startColumnIndex: number, endColumnIndex: number) {
    const sheetViewDelegate = this.handlerDelegate.getSheetViewDelegate()
    const sheetStoreData = sheetViewDelegate.getCurrentSheetStore

    // 高亮开始的单元格
    let highlightCell = this.highlightCell(startRowIndex, startColumnIndex)
    let
      totalCellWidth = 0,
      totalCellHeight = 0,
      minRowIndex = Math.min(startRowIndex, endRowIndex),
      maxRowIndex = Math.max(startRowIndex, endRowIndex),
      minColumnIndex = Math.min(startColumnIndex, endColumnIndex),
      maxColumnIndex = Math.max(startColumnIndex, endColumnIndex)

    // 行高合计
    for (let rowIndex = minRowIndex; rowIndex <= maxRowIndex; rowIndex++) {
      totalCellHeight += sheetViewDelegate.getRowHeight(rowIndex)
    }
    // 列宽合计
    for (let columnIndex = minColumnIndex; columnIndex <= maxColumnIndex; columnIndex++) {
      totalCellWidth += sheetViewDelegate.getColumnWidth(columnIndex)
    }

    // 聚集单元格的上/下边框的宽度
    let borderTopBottomWidth = totalCellHeight - highlightCell.cellHeight
    // 聚集单元格的左/右边框的宽度
    let borderLeftRightWidth = totalCellWidth - highlightCell.cellWidth

    /**
     * 行（行的高亮线，行的范围视图）的top数值
     */
    let selectionRowTopValue = highlightCell.cellY + 1
    if (endRowIndex < startRowIndex) {
      selectionRowTopValue -= borderTopBottomWidth
    }

    // 单选范围的行高亮线高度和方位的调整
    const singleSelectionRowLineView = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().singleSelectionConfig.rowLineViewElementId)!
    singleSelectionRowLineView.setStyle({
      height: `${totalCellHeight - 1}px`,
      top: `${selectionRowTopValue}px`
    })

    // 单选范围的行范围视图的高度和方位的调整
    const singleSelectionRowRangeView = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().singleSelectionConfig.rowRangeViewElementId)!
    singleSelectionRowRangeView.setStyle({
      height: `${totalCellHeight - 1}px`,
      top: `${selectionRowTopValue}px`
    })

    /**
     * 列（列的高亮线，列的范围视图）的left数值
     */
    let selectionColumnLeftValue = highlightCell.cellX + 1
    if (endColumnIndex < startColumnIndex) {
      selectionColumnLeftValue -= borderLeftRightWidth
    }

    // 单选范围的列高亮线宽度和方位的调整
    const singleSelectionColumnLineView = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().singleSelectionConfig.columnLineViewElementId)!
    singleSelectionColumnLineView.setStyle({
      width: `${totalCellWidth - 1}px`,
      left: `${selectionColumnLeftValue}px`
    })

    // 单选范围的列范围视图的宽度和方位的调整
    const singleSelectionColumnRangeElement = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().singleSelectionConfig.columnRangeViewElementId)!
    singleSelectionColumnRangeElement.setStyle({
      width: `${totalCellWidth - 1}px`,
      left: `${selectionColumnLeftValue}px`
    })

    /**
     * 单选的范围单元格的边框设置，以实现范围覆盖
     */
    let singleSelectionDotView = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().singleSelectionConfig.dotViewElementId)!
    let singleSelectionView = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().singleSelectionConfig.viewElementId)!
    singleSelectionView.setStyle({
      width: `${totalCellWidth! - 1}px`,
      height: `${totalCellHeight! - 1}px`
    })

    // 左右边框宽度的设置
    if (endColumnIndex < startColumnIndex) {
      singleSelectionView.setStyle({
        borderLeftWidth: `${borderLeftRightWidth}px`,
        left: `${parseInt(singleSelectionView.style.left) - borderLeftRightWidth}px`
      })
      singleSelectionDotView.setStyle({ right: '-5px' })
    } else {
      singleSelectionView.setStyle({ borderRightWidth: `${borderLeftRightWidth}px` })
      singleSelectionDotView.setStyle({ right: `${-5 - borderLeftRightWidth}px` })
    }

    // 上下边框宽度的设置
    if (endRowIndex < startRowIndex) {
      singleSelectionView.setStyle({
        borderTopWidth: `${borderTopBottomWidth}px`,
        top: `${parseInt(singleSelectionView.style.top) - borderTopBottomWidth}px`
      })
      singleSelectionDotView.setStyle({ bottom: '-5px' })
    } else {
      singleSelectionView.setStyle({ borderBottomWidth: `${borderTopBottomWidth}px` })
      singleSelectionDotView.setStyle({ bottom: `${-5 - borderTopBottomWidth}px` })
    }
  }


  public highlightCell(rowIndex: number, columnIndex: number) {
    const sheetViewDelegate = this.handlerDelegate.getSheetViewDelegate()
    const sheetStoreData = sheetViewDelegate.getCurrentSheetStore()

    let cellStartY = (rowIndex - 1 < 0 ? 0 : sheetStoreData.rowTitleBarYValues[rowIndex - 1]) + this.handlerDelegate.getSheetViewDelegate().getRenderedColumnTitleBarHeight()
    let cellStartX = (columnIndex - 1 < 0 ? 0 : sheetStoreData.columnTitleBarXValues[columnIndex - 1]) + this.handlerDelegate.getSheetViewDelegate().getRenderedRowTitleBarWidth()
    let { width: cellWidth, height: cellHeight } = sheetViewDelegate.getCellSize(rowIndex, columnIndex)!

    // 单选范围视图的显示及大小，方位的设置
    let singleSelectionView = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().singleSelectionConfig.viewElementId)!
    singleSelectionView.setStyle({
      display: 'block',
      borderWidth: '0px',
      width: `${cellWidth! - 1}px`,
      height: `${cellHeight! - 1}px`,
      left: `${cellStartX + 1}px`,
      top: `${cellStartY + 1}px`
    })

    let singleSelectionDotView = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().singleSelectionConfig.dotViewElementId)!
    singleSelectionDotView.setStyle({
      right: '-5px',
      bottom: '-5px'
    })

    // 单选范围的行高亮线显示及高度，方位设置
    const singleSelectionRowLineView = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().singleSelectionConfig.rowLineViewElementId)!
    singleSelectionRowLineView.setStyle({
      display: "block",
      height: `${cellHeight! - 1}px`,
      left: `${sheetViewDelegate.getRenderedRowTitleBarWidth()}px`,
      top: `${cellStartY + 1}px`
    })

    // 单选范围的列高亮线显示及高度，方位设置
    const singleSelectionColumnLineView = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().singleSelectionConfig.columnLineViewElementId)!
    singleSelectionColumnLineView.setStyle({
      display: 'block',
      width: `${cellWidth! - 1}px`,
      top: `${sheetViewDelegate.getRenderedColumnTitleBarHeight()}px`,
      left: `${cellStartX + 1}px`
    })

    // 单选范围的行范围视图的显示及大小，方位设置
    const singleSelectionRowRangeView = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().singleSelectionConfig.rowRangeViewElementId)!
    singleSelectionRowRangeView.setStyle({
      display: 'block',
      width: `${sheetViewDelegate.getRenderedRowTitleBarWidth() - 1}px`,
      height: `${cellHeight! - 1}px`,
      left: `${1}px`,
      top: `${cellStartY + 1}px`
    })

    // 单选范围的列范围视图的显示及大小，方位设置
    const singleSelectionColumnRangeView = sheetViewDelegate.getNode(sheetViewDelegate.getConfiguration().singleSelectionConfig.columnRangeViewElementId)!
    singleSelectionColumnRangeView.setStyle({
      display: 'block',
      height: `${sheetViewDelegate.getRenderedColumnTitleBarHeight() - 1}px`,
      width: `${cellWidth! - 1}px`,
      top: `${1}px`,
      left: `${cellStartX + 1}px`
    })

    return {
      cellHeight: cellHeight!,
      cellWidth: cellWidth!,
      cellX: cellStartX,
      cellY: cellStartY
    }
  }


}