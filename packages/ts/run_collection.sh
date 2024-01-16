file=service/collection/main
pnpm exec tsc src/$file.ts --outDir dist --esModuleInterop
nohup node dist/$file.js >collection.log 2>&1 & echo $! >collection.pid & exit
