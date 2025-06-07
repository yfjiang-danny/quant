export function promiseSettled<DataType, PromiseType>(
  data: DataType[],
  fn: (v: DataType, i: number) => Promise<PromiseType>
) {
  const promises: Promise<PromiseType>[] = [];

  data.forEach((v, i) => {
    promises.push(fn(v, i));
  });

  return Promise.allSettled(promises);
}
