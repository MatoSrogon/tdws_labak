import { NextFunction, Request, Response } from "express";

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user || req.session.user.isAdmin !== 1) {
    return res.status(403).render("shared/403");
  }
  next();
}
