const path = require('path');

module.exports = {
    mode: "production",
  entry: './src/tasks/filterStocks.ts',
  output: {
    filename: 'filterStocks.js',
    path: path.resolve(__dirname, 'tasks-dist')
  }
};
