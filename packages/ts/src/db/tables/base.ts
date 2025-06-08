export interface BaseTableModel {
  create_at?: string;
  update_at?: string;
}

export const IDDataType = "varchar(10)";
export const DateDataType = "varchar(8)";
export const DateTimeDataType = "varchar(19)";
export const SymbolDataType = "varchar(20)";
export const NameDataType = "varchar(250)";
export const NumberFixedDataType = "varchar(10)";
export const IntegerDataType = "integer";
export const MaxNumericDataType = "numeric(13,4)"; // 到亿，保留 4 位小数
export const SmallNumericDataType = "numeric(5,4)"; // 到万，保留 4 位小数 用于费率等小数

export const baseColumns = {
  create_at: {
    dataType: DateTimeDataType,
    notNull: true,
  },
  update_at: {
    dataType: DateTimeDataType,
    notNull: true,
  },
};
