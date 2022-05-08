import Sheet from "./sheet";

export default class AutomoniaSheet {

  private sheet: Sheet

  constructor(containerId: string) {
    this.sheet = new Sheet(containerId)
  }


}