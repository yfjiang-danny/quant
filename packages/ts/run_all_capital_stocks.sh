file=tasks/fillCapital
pnpm exec tsc src/$file.ts --outDir dist --esModuleInterop
nohup node dist/$file.js >all_capital_stock.log 2>&1 & echo $! >all_capital_stock.pid & exit
