import { NextFunction, Request, Response } from "express";
import * as userService from "../services/user.service";
import {
  createUserSchema,
  updateUserSchema,
} from "../validators/user.validator";

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  const search = (req.query.search as string) || "";
  const users = await userService.getAllUsers(search);
  res.render("user/users", { users, search });
};

const getAddUserForm = (req: Request, res: Response) => {
  res.locals.formUser = null;
  res.locals.errors = {};
  res.locals.isEdit = false;
  res.render("user/user-form");
};

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    await userService.createUserByAdmin(validatedData);
    res.redirect("/users");
  } catch (error) {
    next(error);
  }
};

const getEditUserForm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    
    const userId = parseInt(req.params.id as string);
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).render("shared/404");
    }
    res.locals.formUser = user;
    res.locals.errors = {};
    res.locals.isEdit = true;
    res.render("user/user-form");
  } catch (error) {
    next(error);
  }
};
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id as string);
    const validatedData = updateUserSchema.parse(req.body);
    await userService.updateUser(userId, validatedData);
    res.redirect("/users");
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id as string);
    await userService.deleteUser(userId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export {
  getUsers,
  getAddUserForm,
  createUser,
  getEditUserForm,
  updateUser,
  deleteUser,
};
