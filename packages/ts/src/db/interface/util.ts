export function toNumber(columnName: string) {
  return `to_number(${columnName},translate($${columnName},'0123456789.','9999999999D')) $${columnName}_number`;
}
