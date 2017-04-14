## ideas for watcher

### "new" cursor

- keep a trade id or date in memory to query "new" trades with
- update cursor with newest trade after new trades pulled in
- do NOT save cursor to db, start from "now" on boot

### "old" cursor

- on boot, query for newest_historical_trade
- if newest_historical_trade < historical_trade_days, backfill to historical_trade_days and finish
- backfill from "now" until hitting newest_historical_trade
- query for oldest_historical_trade, if < historical_trade_days, finish
- backfill from oldest_historical_trade until hitting historical_trade_days
- finish by removing data before historical_trade_days
