const express = require("express");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const router = express.Router();

const SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const TTL = Number(process.env.TOKEN_TTL_SECONDS || 60);

const schema = z.object({
  client_id: z.string().min(1),
  client_secret: z.string().min(1),
  scope: z.string().optional(),
});

router.post("/token", (req, res, next) => {
  try {
    const body = schema.parse(req.body);

    if (body.client_id !== "demo" || body.client_secret !== "demo") {
      return res.status(401).json({
        error: { code: "INVALID_CLIENT", message: "Invalid client credentials" },
        requestId: req.requestId,
      });
    }

    const scope = body.scope || "orders:write payments:write";
    const token = jwt.sign({ sub: body.client_id, scope }, SECRET, { expiresIn: TTL });

    res.json({
      access_token: token,
      token_type: "Bearer",
      expires_in: TTL,
      scope,
      requestId: req.requestId,
    });
  } catch (err) {
    err.status = 400;
    err.code = "VALIDATION_ERROR";
    err.details = err.errors || null;
    next(err);
  }
});

module.exports = router;