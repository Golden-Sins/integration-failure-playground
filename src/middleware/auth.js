const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function requireAuth(requiredScopes = []) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Missing Bearer token" },
        requestId: req.requestId,
      });
    }

    try {
      const payload = jwt.verify(token, SECRET);
      req.auth = payload;

      const scopes = new Set(String(payload.scope || "").split(/\s+/).filter(Boolean));
      const missing = requiredScopes.filter((s) => !scopes.has(s));

      if (missing.length) {
        return res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "Missing required scope",
            details: { requiredScopes, missingScopes: missing },
          },
          requestId: req.requestId,
        });
      }

      next();
    } catch {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
        requestId: req.requestId,
      });
    }
  };
}

module.exports = { requireAuth };