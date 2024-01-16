file=tasks/filterCurrent
pnpm exec tsc src/$file.ts --outDir dist --esModuleInterop
nohup node dist/$file.js >filter_current_stocks.log 2>&1 & echo $! >filter_current_stocks.pid & exit
