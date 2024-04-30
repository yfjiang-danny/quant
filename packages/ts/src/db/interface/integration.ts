export namespace Integration {
    /**
     * SELECT symbol,translate(turnover,'0123456789.','9999999999D'),to_number(turnover,translate(turnover,'0123456789.','9999999999D'))
FROM "stock_snapshots"
where date = '20240423'
and turnover is not null
LIMIT 50
     */
/*
select SUM(b.t) s,a.industry
from stock_info a
left join (
SELECT symbol,to_number(turnover,translate(turnover,'0123456789.','9999999999D')) t
FROM "stock_snapshots"
where date = '20240423'
and turnover is not null
) b
on a.symbol = b.symbol
where a.industry is not null
group by a.industry
order by s desc




*/
}