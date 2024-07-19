import { Batch, OrderLine } from './batch';

const make_batch_and_line = (
  sku: string,
  batch_qty: number,
  line_qty: number,
) => {
  const batch = new Batch('batch-001', sku, batch_qty, new Date());
  const line = new OrderLine('order-ref', sku, line_qty);

  return {
    batch,
    line,
  };
};

describe('batch', () => {
  test('размещение количества товара уменьшает его доступное количество', () => {
    const batch = new Batch('batch-001', 'SMALL TABLE', 20, new Date());
    const line = new OrderLine('order-123', 'SMALL TABLE', 2);

    batch.allocate(line);

    expect(batch.available_quantity).toBe(18);
  });
  test('можно разместить, если доступное больше, чем требуется ', () => {
    const { batch: large_batch, line: small_line } = make_batch_and_line(
      'ELEGANT LAMP',
      20,
      2,
    );

    expect(large_batch.can_allocate(small_line)).toBe(true);
  });
  test('нельзя разместить, если доступное меньше требуемого', () => {
    const { batch: small_batch, line: large_line } = make_batch_and_line(
      'ELEGANT_LAMP',
      2,
      20,
    );

    expect(small_batch.can_allocate(large_line)).toBe(false);
  });
  test('можно разместить, если доступное равно требуемому', () => {
    const { batch, line } = make_batch_and_line('ELEGANT_LAMP', 20, 20);

    expect(batch.can_allocate(line)).toBe(true);
  });
  test('нельзя разместить, если единицы складского учета не совпадают', () => {
    const batch = new Batch('batch-001', 'UNCOMFORTABLE-CHAIR', 100);
    const line = new OrderLine('order-123', 'EXPENSIVE-TOASTER', 10);

    expect(batch.can_allocate(line)).toBe(false);
  });
  test('можно отменить размещение только уже размещенные единиц', () => {
    const { batch, line: unallocated_line } = make_batch_and_line(
      'DECORATIVE-TRINKET',
      20,
      2,
    );

    batch.deallocate(unallocated_line);

    expect(batch.available_quantity).toBe(20);
  });
  test('операция размещения индепотентна', () => {
    const { batch, line } = make_batch_and_line('ANGULAR-DESK', 20, 2);

    batch.allocate(line);
    batch.allocate(line);

    expect(batch.available_quantity).toBe(18);
  });
});
