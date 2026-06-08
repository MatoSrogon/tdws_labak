import { Request, Response } from "express";
import { ZodError } from "zod";

import {
  createAnswer,
  deleteAnswer,
  getAnswerById,
  getAnswersByQuestion,
  updateAnswer,
} from "../services/answers.service";
import {
  answerCreateSchema,
  answerUpdateSchema,
} from "../validators/answers.validator";

const getQuestionAnswers = async (req: Request, res: Response) => {
  try {
    const question_id = parseInt(req.params.id as string);

    const answers = await getAnswersByQuestion(question_id);

    res.status(200).json(answers);
  } catch (error) {
    res.status(500).json({
      error:
        "Failed to load answers: " +
        (error instanceof Error ? error.message : String(error)),
    });
  }
};

const postQuestionAnswer = async (req: Request, res: Response) => {
  try {
    const question_id = parseInt(req.params.id as string);
    const user_id = req.session.user?.id!;

    const validatedData = answerCreateSchema.parse(req.body);

    const id = await createAnswer(validatedData, question_id, user_id);

    res.status(201).json({
      message: "Answer created successfully",
      id,
    });
  } catch (error) {
    let errorMessage =
      "Failed to create answer: " +
      (error instanceof Error ? error.message : String(error));
    if (error instanceof ZodError) {
      errorMessage = error.issues.map((issue) => issue.message).join(", ");
    }
    res.status(400).json({ error: errorMessage });
  }
};

const patchAnswer = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const user_id = req.session.user?.id!;

    const answer = await getAnswerById(id);

    if (!answer) {
      return res.status(404).json({ error: "Answer not found" });
    }

    if (answer.user_id !== user_id) {
      return res
        .status(403)
        .json({ error: "You are not authorized to edit this answer" });
    }

    const validatedData = answerUpdateSchema.parse(req.body);

    await updateAnswer(id, validatedData);

    res.status(200).json({ message: "Answer updated successfully" });
  } catch (error) {
    let errorMessage =
      "Failed to update answer: " +
      (error instanceof Error ? error.message : String(error));
    if (error instanceof ZodError) {
      errorMessage = error.issues.map((issue) => issue.message).join(", ");
    }
    res.status(400).json({ error: errorMessage });
  }
};

const deleteAnswerController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const user_id = req.session.user?.id!;
    const isAdmin = false; // Implementujeme neskor ked bude admin funkcionalita

    const answer = await getAnswerById(id);

    if (!answer) {
      return res.status(404).json({ error: "Answer not found" });
    }

    if (answer.user_id !== user_id && !isAdmin) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this answer" });
    }

    await deleteAnswer(id);

    res.status(200).json({ message: "Answer deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error:
        "Failed to delete answer: " +
        (error instanceof Error ? error.message : String(error)),
    });
  }
};

export {
  deleteAnswerController,
  getQuestionAnswers,
  patchAnswer,
  postQuestionAnswer,
};
