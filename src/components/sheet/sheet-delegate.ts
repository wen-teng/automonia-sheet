import { Workbook, Worksheet } from "exceljs"
import Configuration from "./configuration"
import Store from "./store"
import SheetStore from "./store/sheet-store"

export default interface SheetDelegate {

  // 获取容器下的节点
  getNode(nodeId: string): HTMLElement | null

  // 获取配置对象
  getConfiguration(): Configuration

  // 获取缓存对象
  getStore(): Store

  // 获取当前工作表的缓存数据
  getCurrentSheetStore(): SheetStore

  // 获取已经渲染了的行标题栏的宽度
  getRenderedRowTitleBarWidth(): number

  // 获取已经渲染了的列标题栏的高度
  getRenderedColumnTitleBarHeight(): number

}