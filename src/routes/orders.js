const express = require("express");
const { z } = require("zod");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const idemStore = new Map();

const schema = z.object({
  order_id: z.string().min(1),
  customer_id: z.string().min(1),
  amount: z.number().positive(),
  currency: z.enum(["EUR", "USD", "GBP"]),
});

router.post("/", requireAuth(["orders:write"]), (req, res, next) => {
  try {
    const idemKey = req.headers["idempotency-key"];
    if (!idemKey) {
      return res.status(400).json({
        error: { code: "MISSING_IDEMPOTENCY_KEY", message: "Idempotency-Key header required" },
        requestId: req.requestId,
      });
    }

    if (idemStore.has(idemKey)) {
      return res.status(409).json({
        error: { code: "IDEMPOTENCY_CONFLICT", message: "Duplicate idempotency key" },
        requestId: req.requestId,
      });
    }

    const body = schema.parse(req.body);
    const resp = {
      id: `ord_${Math.random().toString(36).slice(2, 10)}`,
      status: "CREATED",
      ...body,
      requestId: req.requestId,
    };

    idemStore.set(idemKey, resp);
    res.status(201).json(resp);
  } catch (err) {
    err.status = 400;
    err.code = "VALIDATION_ERROR";
    err.details = err.errors || null;
    next(err);
  }
});

module.exports = router;