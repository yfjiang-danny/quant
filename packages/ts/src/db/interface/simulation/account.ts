import moment from "moment";
import { QueryLike } from "sql";
import { dbQuery } from "../../connect";
import {
  AccountTable,
  AccountTableModel,
} from "../../tables/simulation/account";
// import { v4 } from "uuid";

export namespace IAccountTable {
  export function createAccount(name: string, amount: number) {
    const id = Date.now().toString().slice(0, 10);

    const querys = AccountTable.insert({
      createAt: moment().format("YYYY-MM-DD hh:mm:ss"),
      updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
      account_id: id,
      name: name,
      amount: amount,
      available: amount,
      holding: 0,
      init_amount: amount,
      interest: 0,
      interest_rate: 0,
      date: moment().format("YYYYMMDD"),
      time: moment().format("HH:mm:ss"),
    }).toQuery();

    return dbQuery<AccountTableModel[]>(querys);
  }

  export function updateByName(account: Omit<AccountTableModel, "account_id">) {
    return dbQuery<AccountTableModel[]>(
      AccountTable.update({
        ...account,
        updateAt: moment().format("YYYY-MM-DD hh:mm:ss"),
      })
        .where(AccountTable.name.equals(account.name))
        .toQuery()
    );
  }

  export function queryAccountByName(name: string) {
    return dbQuery<AccountTableModel[]>(
      AccountTable.select(AccountTable.star())
        .where(AccountTable.name.equals(name))
        .toQuery()
    );
  }
}
