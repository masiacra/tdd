import { Batch, OrderLine } from 'src/batch/batch';

export class OutOfStockException extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

const comparator = (a: Batch, b: Batch): number => {
  if (!a.eta) {
    return -1;
  }

  if (!b.eta) {
    return 1;
  }

  return a.eta.getTime() - b.eta.getTime();
};
/**
 * функция размещения товарной позиции заказа при наличии набора партий
 */
export const allocate = (line: OrderLine, batches: Batch[]): string => {
  const batch = batches
    .sort(comparator)
    .find((batch) => batch.can_allocate(line));

  if (!batch) {
    throw new OutOfStockException(`Out of stock for sku ${line.sku}`);
  }
  batch.allocate(line);

  return batch.reference;
};
