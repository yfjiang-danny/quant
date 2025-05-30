import moment from "moment";
import { dbQuery } from "../../connect";
import {
  StrategyTable,
  StrategyTableModel,
} from "../../tables/strategy/strategy";
// import { v4 } from "uuid";

export namespace IStrategyTable {
  export function insert(strategy: Omit<StrategyTableModel, "id">) {
    const id = Date.now().toString().slice(0, 10);
    return dbQuery<StrategyTableModel[]>(
      (
        StrategyTable.insert({
          createAt: moment().format("YYYY-MM-DD HH:mm:ss"),
          updateAt: moment().format("YYYY-MM-DD HH:mm:ss"),
          ...strategy,
          id: id,
        }) as any
      )
        .onConflict({
          columns: [StrategyTable.name.name, StrategyTable.date.name],
          update: StrategyTable.columns
            .filter(
              (v) =>
                ![
                  StrategyTable.id?.name as string,
                  StrategyTable.name?.name as string,
                  StrategyTable.date?.name as string,
                  StrategyTable.createAt?.name as string,
                ].includes(v.name as unknown as string)
            )
            .map((v) => {
              return v.name;
            }),
        })
        .toQuery()
    );
  }

  export function updateByName(strategy: Omit<StrategyTableModel, "id">) {
    return dbQuery<StrategyTableModel[]>(
      StrategyTable.update({
        ...strategy,
        updateAt: moment().format("YYYY-MM-DD HH:mm:ss"),
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

  export function queryByNameAndDate(name: string, date: string) {
    return dbQuery<StrategyTableModel[]>(
      StrategyTable.select(StrategyTable.star())
        .where(StrategyTable.name.equals(name))
        .where(StrategyTable.date.equals(date))
        .toQuery()
    );
  }
}
