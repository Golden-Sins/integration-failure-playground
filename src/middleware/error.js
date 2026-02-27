function notFound(req, res) {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Route not found", path: req.path },
    requestId: req.requestId,
  });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || "INTERNAL_ERROR";
  res.status(status).json({
    error: {
      code,
      message: err.message || "Unexpected error",
      details: err.details || null,
    },
    requestId: req.requestId,
  });
}

module.exports = { notFound, errorHandler };