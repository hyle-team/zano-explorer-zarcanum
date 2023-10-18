const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function (app) {
  app.use(
    ["/proxy"],
    createProxyMiddleware({
      target: "http://127.0.0.1:3005",
      changeOrigin: true
    })
  );
};
