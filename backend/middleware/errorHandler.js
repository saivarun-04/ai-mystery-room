/**
 * Centralized error handler.
 * Returns a consistent JSON shape: { error: string, code?: string }
 */
export const errorHandler = (err, req, res, next) => {
  console.error("[ERROR]", err.message, err.stack);

  const status = err.status || 500;
  const code = err.code || "INTERNAL_ERROR";

  res.status(status).json({
    error: err.message,
    code,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  err.code = "ROUTE_NOT_FOUND";
  next(err);
};
