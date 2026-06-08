import { Router } from "express";
import { protectRoutes } from "../middlewares/route-protect.middleware";
import * as userController from "../controllers/user.controller";
import { adminOnly } from "../middlewares/admin-only.middleware";

const router = Router();

router.use(protectRoutes);
router.use(adminOnly);

router.get("", userController.getUsers);
router.get("/add", userController.getAddUserForm);
router.post("/add", userController.createUser);

router.get("/edit/:id", userController.getEditUserForm);
router.post("/edit/:id", userController.updateUser);

router.delete("/:id", userController.deleteUser);

export default router;
