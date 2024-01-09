file=tasks/getAllStocks
pnpm exec tsc src/$file.ts --outDir dist --esModuleInterop
nohup node dist/$file.js >all_stocks.log 2>&1 & echo $! >all_stocks.pid & exit
