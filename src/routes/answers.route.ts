import express from "express";

import {
    deleteAnswerController,
    patchAnswer,
} from "../controllers/answer.controller";
import { protectRoutes } from "../middlewares/route-protect.middleware";

const router = express.Router();

router.use(protectRoutes);

router.patch("/:id", patchAnswer);

router.delete("/:id", deleteAnswerController);

export default router;
