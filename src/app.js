const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const YAML = require("yaml");
const swaggerUi = require("swagger-ui-express");

const requestId = require("./middleware/requestId");
const { notFound, errorHandler } = require("./middleware/error");

const authRoutes = require("./routes/auth");
const ordersRoutes = require("./routes/orders");
const paymentsRoutes = require("./routes/payments");
const statusRoutes = require("./routes/status");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(requestId);

morgan.token("reqId", (req) => req.requestId);
app.use(morgan(":method :url :status :response-time ms reqId=:reqId"));

app.get("/health", (req, res) => {
  res.json({ ok: true, requestId: req.requestId });
});

app.use("/auth", authRoutes);
app.use("/orders", ordersRoutes);
app.use("/payments", paymentsRoutes);
app.use("/status", statusRoutes);

// Swagger
try {
  const openapiText = fs.readFileSync("docs/openapi.yaml", "utf8");
  const openapiDoc = YAML.parse(openapiText);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDoc));
} catch (e) {
  console.warn("Swagger not loaded:", e.message);
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;