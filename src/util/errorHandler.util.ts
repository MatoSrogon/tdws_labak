import { Request } from "express";
import { ZodError } from "zod";

export const handleFormError = (
  error: ZodError | Error | unknown,
  req: Request,
  redirectPath: string,
) => {
  req.session.error = error;
  req.session.formData = req.body;
  req.session.redirectPath = redirectPath;
};
