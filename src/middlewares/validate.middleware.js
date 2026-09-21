import { AppError } from "../utils/AppError.js";

export function validate(schema, source = "body") {
  return (req, res, next) => {
    // Express 5 leaves req.body undefined when nothing was parsed, so fall back to {}
    const result = schema.safeParse(req[source] ?? {});

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".") || source}: ${issue.message}`)
        .join("; ");
      return next(new AppError(message, 400));
    }

    // Swap in the parsed copy: unknown fields stripped, strings trimmed.
    // req.query is read-only in Express 5, so for queries we validate only.
    if (source === "body") req.body = result.data;
    next();
  };
}