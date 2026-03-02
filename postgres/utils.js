const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const requireFields = (body, fields) => {
  const missing = fields.filter((f) => {
    const value = body[f];
    return value === undefined || value === null || String(value).trim() === "";
  });
  if (missing.length > 0) {
    throw createError(400, `Faltan campos: ${missing.join(", ")}`);
  }
};

const parseIdParam = (value, fieldName = "id") => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw createError(400, `${fieldName} debe ser entero positivo`);
  }
  return id;
};

const parseIntField = (value, fieldName) => {
  const n = Number(value);
  if (!Number.isInteger(n)) {
    throw createError(400, `${fieldName} debe ser entero`);
  }
  return n;
};

const parseNumberField = (value, fieldName) => {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw createError(400, `${fieldName} debe ser numero`);
  }
  return n;
};

module.exports = {
  createError,
  asyncHandler,
  requireFields,
  parseIdParam,
  parseIntField,
  parseNumberField,
};
