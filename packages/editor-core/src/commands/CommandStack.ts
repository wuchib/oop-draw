export class CommandStack<T> {
  private readonly items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  peek(): T | undefined {
    return this.items.at(-1);
  }
}
