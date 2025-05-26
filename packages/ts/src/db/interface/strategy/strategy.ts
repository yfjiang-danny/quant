import moment from "moment";
import { dbQuery } from "../../connect";
import {
  StrategyTable,
  StrategyTableModel,
} from "../../tables/strategy/strategy";
import { v4 } from "uuid";

export namespace IStrategyTable {
  export function insert(strategy: Omit<StrategyTableModel, "id">) {
    const id = v4().slice(0, 8);
    return dbQuery<StrategyTableModel[]>(
      StrategyTable.insert({
        createAt: moment().format("YYYY-MM-DD hh:mm:ss"),
        updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
        ...strategy,
        id: id,
      }).toQuery()
    );
  }

  export function updateByName(strategy: Omit<StrategyTableModel, "id">) {
    return dbQuery<StrategyTableModel[]>(
      StrategyTable.update({
        ...strategy,
        updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
      })
        .where(StrategyTable.name.equals(strategy.name))
        .toQuery()
    );
  }

  export function queryByName(name: string) {
    return dbQuery<StrategyTableModel[]>(
      StrategyTable.select(StrategyTable.star())
        .where(StrategyTable.name.equals(name))
        .toQuery()
    );
  }
}
