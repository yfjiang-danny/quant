export interface BaseTableModel {
  createAt?: string;
  updateAt?: string;
}

export const dateDataType = "varchar(8)";
export const dateTimeDataType = "varchar(19)";
export const symbolDataType = "varchar(20)";
export const nameDataType = "varchar(250)";
export const numberFixedDataType = "varchar(10)";
export const IntegerDataType = "integer";
export const NumericDataType = "numeric(13,4)"; // 到亿，保留 4 位小数

export const baseColumns = {
  createAt: {
    dataType: dateTimeDataType,
    notNull: true,
  },
  updateAt: {
    dataType: dateTimeDataType,
    notNull: true,
  },
};
