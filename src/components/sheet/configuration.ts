export default class Configuration {

  // 工作簿的容器ID
  containerElementId: string

  // canvas节点ID
  canvasElementId = "sheet-canvas-id"

  // 空工作簿下渲染的行数
  rowAmountOfEmptySheet = 100

  // 空工作簿下渲染的列数
  columnAmountOfEmptySheet = 26

  // 默认的行高
  defaultRowHeight = 24

  // 默认的列宽
  defaultColumnWidth = 107

  // 行标题栏是否显示
  rowTitleBarVisible = true

  // 列标题栏是否显示
  columnBarTitleVisible = true

  // 行标题栏的宽度
  rowTitleBarWidth = 50

  // 列标题栏的高度
  columnTitleBarHeight = 24

  // 分割线的边框颜色
  splitLineStrokeStyle = '#dcdfe6'

  // 全选单元格的配置信息
  selectAllCellConfig = {
    
    // 三角形间距距离
    triangleIntervalSpace: 3,

    // 三角形的填充颜色
    triangleFillStyle: '#ededed'
  }


  singleSelection = {
  }


  constructor(containerId: string) {
    this.containerElementId = containerId
  }

}