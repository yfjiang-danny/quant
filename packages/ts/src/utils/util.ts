export function deepCopyWithJson(data: unknown) {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    return data;
  }
}
