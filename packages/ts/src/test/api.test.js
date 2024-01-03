const { TUSHARE_API } = require("../api");

test("getAllStock", () => {
  TUSHARE_API.getAllStock().then((res) => {
    expect(res.data.length).toBeGreaterThan(0);
  });
});
