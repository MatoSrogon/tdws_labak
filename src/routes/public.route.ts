import express from "express";
import {
  getLogin,
  getSignUp,
  login,
  logout,
  renderAboutPage,
  renderHomePage,
  signUp,
} from "../controllers/public.controller";

const router = express.Router();

router.get("/", renderHomePage);
router.get("/about", renderAboutPage);

router.get("/signup", getSignUp);
router.post("/signup", signUp);

router.get("/login", getLogin);
router.post("/login", login);

router.post("/logout", logout);

export default router;
