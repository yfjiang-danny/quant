file=tasks/filterStocks
pnpm exec tsc src/$file.ts --outDir dist --esModuleInterop
nohup node dist/$file.js >filter_stocks.log 2>&1 & echo $! >filter_stocks.pid & exit
