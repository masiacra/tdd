import { Batch, OrderLine } from '../batch/batch';
import { addDays } from 'date-fns';
import { OutOfStockException, allocate } from './allocate';

const today = new Date();
const tomorrow = addDays(today, 1);
const later = addDays(today, 10);

describe('allocate', () => {
  test('предпочитает текущие партии товара тем, что будут отгружены', () => {
    const in_stock_batch = new Batch('in-stock-batch', 'RETRO CLOCK', 100);
    const shipment_batch = new Batch(
      'shipment-batch',
      'RETRO CLOCK',
      100,
      tomorrow,
    );
    const line = new OrderLine('oref', 'RETRO CLOCK', 10);

    allocate(line, [in_stock_batch, shipment_batch]);

    expect(in_stock_batch.available_quantity).toBe(90);
    expect(shipment_batch.available_quantity).toBe(100);
  });
  test('предпочитает более ранние партии товара', () => {
    const earliest = new Batch('speedy-batch', 'MINIMALIST SPOON', 100, today);
    const medium = new Batch('normal-batch', 'MINIMALIST SPOON', 100, tomorrow);
    const latest = new Batch('slow-batch', 'MINIMALIST SPOON', 100, later);

    const line = new OrderLine('order1', 'MINIMALIST SPOON', 10);

    allocate(line, [medium, earliest, latest]);

    expect(earliest.available_quantity).toBe(90);
    expect(medium.available_quantity).toBe(100);
    expect(latest.available_quantity).toBe(100);
  });
  test('возвращает ссылку на выбранную партию', () => {
    const in_stock_batch = new Batch(
      'in-stock-batch-ref',
      'HIGHBROW-POSTER',
      100,
    );
    const shipment_batch = new Batch(
      'shipment-batch-ref',
      'HIGHBROW-POSTER',
      100,
      tomorrow,
    );
    const line = new OrderLine('oref', 'HIGHBROW-POSTER', 10);
    const allocation = allocate(line, [in_stock_batch, shipment_batch]);

    expect(allocation).toBe(in_stock_batch.reference);
  });
  test('выбрасывается исключение, если не хватает количесвта для аллокации', () => {
    const batch = new Batch('batch-1', 'SMALL FORK', 10, today);
    const line = new OrderLine('order-1', 'SMALL FORK', 10);

    expect(allocate(line, [batch])).toThrow(OutOfStockException);
  });
});
