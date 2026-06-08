import { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createUser, loginUser } from "../services/user.service";
import { loginSchema, signupSchema } from "../validators/user.validator";

//@ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const renderHomePage = (req: Request, res: Response): void => {
  res.render("public/index");
};

const renderAboutPage = (req: Request, res: Response): void => {
  res.render("public/about");
};

const getSignUp = (req: Request, res: Response): void => {
  const errorMessage = req.session.errorMessage;
  const formData = req.session.formData || {};
  req.session.errorMessage = "";
  req.session.formData = null;
  res.render("public/signup", { errorMessage, formData });
};

const getLogin = (req: Request, res: Response): void => {
  res.render("public/login");
};

const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = signupSchema.parse(req.body);
    await createUser(validatedData);
    res.redirect("/login");
  } catch (error) {
    req.session.errorMessage =
      error instanceof Error ? error.message : "Registration failed";
    req.session.formData = req.body;
    req.session.save(() => {
      res.redirect("/signup");
    });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const user = await loginUser(validatedData);
    if (!user) {
      res.status(401).render("shared/500", {
        message: "Invalid email or password",
      });
      return;
    }
    req.session.isAuthenticated = true;
    req.session.user = {
      id: user.user_id!,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    };

    req.session.save(() => {
      res.redirect("/");
    });
  } catch (error) {
    console.error(error);
    res.status(400).render("shared/500", {
      message: error instanceof Error ? error.message : "Login failed",
    });
  }
};

const logout = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session during logout:", err);
    }
    res.redirect("/login");
  });
};



export {
  getLogin,
  getSignUp,
  login,
  logout,
  renderAboutPage,
  renderHomePage,
  signUp,
};
