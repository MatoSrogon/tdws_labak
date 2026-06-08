import { NextFunction, Request, Response } from "express";

export function checkAuthStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.session.user;
  if (!user) {
    return next();
  }
  res.locals.isAuthenticated = true;
  res.locals.user = user;
  res.locals.isAdmin = user.isAdmin === 1;
  //console.log(user);

  next();
}
