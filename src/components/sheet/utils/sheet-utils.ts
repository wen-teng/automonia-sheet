export default (new class {

  /**
   * 将列序号（数字）转换为字母（字符）
   * 
   * 65 字母A的ascii码
   * 26 字母A-字母Z的数量
   * 
   * @param columnIndex 列序号
   */
  getColumnTitleFromIndex(columnIndex: number): string {
    let columnTitle = ''
    do {
      columnTitle += String.fromCharCode(65 + columnIndex % 65)
      columnIndex = columnIndex > 26 ? (columnIndex - 26) : -1
    } while (columnIndex >= 0)
    return columnTitle
  }

})