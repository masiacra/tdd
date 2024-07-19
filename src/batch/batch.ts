/**
 * Объект-значение - это любой объект предметной области, который уникально идентифицируется
 * содержащимися в нем данными; обычно мы делаем их немутируемыми.
 */

/**
 * товарная позиция
 */
export class OrderLine {
  /**
   *
   * @param orderid - ссылка на заказ
   * @param sku stock keeping unit - единица складского учета
   * @param qty - количество
   */
  constructor(
    public readonly orderid: string,
    public readonly sku: string,
    public readonly qty: number,
  ) {}
}

/**
 * партия заказа
 */
export class Batch {
  private purchased_quantity: number = 0;
  private readonly allocations = new Set<OrderLine>();
  /**
   *
   * @param reference - ссылка на заказ
   * @param sku - единица складского учета
   * @param qty - количество
   * @param eta - предполагаемый срок прибытия
   */
  constructor(
    public reference: string,
    public sku: string,
    public qty: number,
    public eta?: Date,
  ) {
    this.purchased_quantity = qty;
  }

  allocate(order: OrderLine): void {
    if (this.can_allocate(order)) {
      this.allocations.add(order);
    }
  }

  deallocate(line: OrderLine): void {
    if (this.allocations.has(line)) {
      this.allocations.delete(line);
    }
  }

  get allocated_quantity(): number {
    let sum = 0;
    this.allocations.forEach((line) => {
      sum += line.qty;
    });

    return sum;
  }

  get available_quantity(): number {
    return this.purchased_quantity - this.allocated_quantity;
  }

  can_allocate(order: OrderLine): boolean {
    return this.sku === order.sku && this.available_quantity >= order.qty;
  }
}
