import { NextFunction, Request, Response } from "express";

export const protectRoutes = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  //console.log(res.locals);
  if (!res.locals.isAuthenticated) {
    return res.status(401).render("shared/401");
  }
  next();
};
