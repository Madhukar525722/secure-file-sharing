const { createProxyMiddleware } = require("http-proxy-middleware");

// Default value for local development
const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";

module.exports = function (app) {
  app.use(
    "/api", // Proxy only API requests
    createProxyMiddleware({
      target: backendUrl,
      changeOrigin: true,
    })
  );
};
