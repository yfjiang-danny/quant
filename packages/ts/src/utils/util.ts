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
