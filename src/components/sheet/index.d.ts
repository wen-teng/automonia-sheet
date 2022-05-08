declare interface HTMLElement {

  // 便捷设置style
  setStyle(styleObj: { [key: string]: string }): void

  // 便捷获取容器下的节点
  // getNode(containerId: string, nodeId: string): HTMLElement | null
}



declare interface CSSStyleDeclaration {
  [key: string]: string
}