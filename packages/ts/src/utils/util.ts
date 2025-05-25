export function deepCopyWithJson(data: unknown) {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    return data;
  }
}

/**
 * 分批处理，适用于分组间没有顺序关系的任务
 * @param arr
 * @param batchSize
 */
export function batchTask<T>(
  arr: T[],
  batchSize: number,
  fn: (bathArr: T[]) => void
) {
  const size = batchSize,
    len = arr.length;
  let start = 0,
    end = size;
  while (start < len && end > start) {
    fn(arr.slice(start, end));
    start = end;
    end = start + size;
  }
}

/**
 *
 * @param amount
 * @param type 0 - buy, 1 - sell
 */
export function calcFee(amount: number, type: 0 | 1) {
  const taxRate = 0.0005;
  const commissionRate = 0.00025;

  if (type === 0) {
    return Math.max(5, Number((amount * commissionRate).toFixed(2)));
  }

  if (type === 1) {
    return (
      Number((amount * taxRate).toFixed(2)) +
      Math.max(5, Number((amount * commissionRate).toFixed(2)))
    );
  }

  return 0;
}
