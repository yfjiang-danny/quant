file=tasks/getAllStocks
pnpm exec tsc src/$file.ts --outDir dist --esModuleInterop
nohup node dist/$file.js >all_stock.log 2>&1 & echo $! >all_stock.pid & exit
