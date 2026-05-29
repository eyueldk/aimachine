export class BoundedBuffer<T> {
  private readonly items: T[] = [];

  constructor(private readonly maxEntries: number) {}

  push(item: T): void {
    this.items.push(item);
    while (this.items.length > this.maxEntries) {
      this.items.shift();
    }
  }

  getRecent(limit?: number): T[] {
    if (limit === undefined) {
      return [...this.items];
    }
    return this.items.slice(-limit);
  }

  get length(): number {
    return this.items.length;
  }

  clear(): void {
    this.items.length = 0;
  }
}
