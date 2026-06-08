import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let errorMessage =
    "Operation failed: " +
    (error instanceof Error ? error.message : String(error));
  if (error instanceof ZodError) {
    errorMessage = error.issues.map((issue) => issue.message).join("\n");
  }
  req.session.errorMessage = errorMessage;

  if (req.session.redirectPath) {
    return req.session.save(() => {
      res.redirect(req.session.redirectPath!);
    });
  }
  console.log("errorHandler:", error);
  res.status(500).render("shared/500");
};
