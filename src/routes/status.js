const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 10000);
const limit = Number(process.env.RATE_LIMIT_MAX || 5);

const limiter = rateLimit({
  windowMs,
  limit,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader("Retry-After", String(Math.ceil(windowMs / 1000)));
    res.status(429).json({
      error: { code: "RATE_LIMITED", message: "Too many requests" },
      requestId: req.requestId,
    });
  },
});

router.use(limiter);

router.get("/:code", (req, res) => {
  const code = Number(req.params.code) || 200;
  res.status(code).json({ simulated: true, status: code, requestId: req.requestId });
});

module.exports = router;