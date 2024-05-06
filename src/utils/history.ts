export default class CustomHistory {
  private history: string[] = [];
  private currentIndex: number = -1;

  public addPage(page: string) {
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(page);
    this.currentIndex++;
  }

  public goToPreviousPage(): string {
    console.log("goToPreviousPage");
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    } else {
      return "No previous page";
    }
  }

  public goToNextPage(): string {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    } else {
      return "No next page";
    }
  }

  public getCurrentPage(): string {
    return this.history[this.currentIndex];
  }

  get hasPreviousPage(): boolean {
    return this.currentIndex > 0;
  }
}
