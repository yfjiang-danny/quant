"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseColumns = exports.IntegerDataType = exports.numberFixedDataType = exports.nameDataType = exports.symbolDataType = exports.dateTimeDataType = exports.dateDataType = void 0;
exports.dateDataType = "varchar(8)";
exports.dateTimeDataType = "varchar(19)";
exports.symbolDataType = "varchar(20)";
exports.nameDataType = "varchar(250)";
exports.numberFixedDataType = "varchar(10)";
exports.IntegerDataType = "integer";
exports.baseColumns = {
    createAt: {
        dataType: exports.dateTimeDataType,
        notNull: true,
    },
    updateAt: {
        dataType: exports.dateTimeDataType,
        notNull: true,
    },
};
