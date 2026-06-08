import express from "express";

import {
  getQuestionList,
  getAskQuestion,
  postAskQuestion,
  getConfirm,
  getQuestionDetails,
  getEditQuestion,
  postEditQuestion,
  postDeleteQuestion,
} from "../controllers/questionList.controller";
import { protectRoutes } from "../middlewares/route-protect.middleware";
import { getQuestionAnswers, postQuestionAnswer } from "../controllers/answer.controller";
import upload from "../config/multer";

const router = express.Router();

router.get("/questions", getQuestionList);

router.use(protectRoutes);

router.get("/questions/:id", getQuestionDetails);

router.get("/questions/:id/answers", getQuestionAnswers);
router.post("/questions/:id/answers", postQuestionAnswer);

router.get("/questions/:id/edit", getEditQuestion);
router.post("/questions/:id/edit", 
  upload.single("image"),
  postEditQuestion);

router.post("/questions/:id/delete", postDeleteQuestion);

router.get("/askQuestion", getAskQuestion);

router.post("/askQuestion", upload.single("image"), postAskQuestion);

router.get("/confirm", getConfirm);

export default router;
