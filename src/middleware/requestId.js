const { v4: uuidv4 } = require("uuid");

module.exports = function requestId(req, res, next) {
  const incoming = req.headers["x-request-id"];
  req.requestId = incoming || uuidv4();
  res.setHeader("X-Request-Id", req.requestId);
  next();
};