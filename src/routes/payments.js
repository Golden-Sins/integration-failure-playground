const express = require("express");
const { z } = require("zod");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const FLAKY_RATE = Number(process.env.FLAKY_RATE || 0.2);

const schema = z.object({
  order_id: z.string().min(1),
  amount: z.number().positive(),
  currency: z.enum(["EUR", "USD", "GBP"]),
  method: z.enum(["card", "bank_transfer"]),
});

router.post("/", requireAuth(["payments:write"]), (req, res, next) => {
  try {
    const flakyEnabled = String(req.headers["x-flaky"] || "").toLowerCase() === "true";
    if (flakyEnabled && Math.random() < FLAKY_RATE) {
      const e = new Error("Upstream provider error (simulated)");
      e.status = 500;
      e.code = "UPSTREAM_ERROR";
      throw e;
    }

    const body = schema.parse(req.body);

    res.json({
      id: `pay_${Math.random().toString(36).slice(2, 10)}`,
      status: "APPROVED",
      ...body,
      requestId: req.requestId,
    });
  } catch (err) {
    if (!err.status) {
      err.status = 400;
      err.code = "VALIDATION_ERROR";
      err.details = err.errors || null;
    }
    next(err);
  }
});

module.exports = router;