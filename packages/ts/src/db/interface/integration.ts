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
  /**
 # Calculate industry
select t.industry,COUNT(t.industry) c,SUM(t.nturnover) sturnover,SUM(nvolume) svolume,AVG(t.nturnover) aturnover,AVG(t.nvolume) avolume  
from
(
SELECT b.industry,to_number(a.turnover,translate(a.turnover,'0123456789.','9999999999D')) nturnover,to_number(a.volume,translate(a.volume,'0123456789.','9999999999D')) nvolume
FROM "stock_snapshots" as a
left join "stock_info" as b
on a.symbol=b.symbol
where date='20240906'
and a.turnover is not null
and a.volume is not null
and b.industry is not null
) as t
group by t.industry
order by aturnover desc

 */
}
