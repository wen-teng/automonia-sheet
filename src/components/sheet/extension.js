/**
 * 扩展一些类的功能方法
 */


// 扩张HTMLElement的方法
HTMLElement.prototype.setStyle = function (styleObj) {
  if (!styleObj) {
    return
  }
  if (!(styleObj instanceof Object)) {
    return
  }
  for (let styleKey of Object.keys(styleObj)) {
    this.style[styleKey] = styleObj[styleKey]
  }
}