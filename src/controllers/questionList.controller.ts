import { NextFunction, Request, Response } from "express";
import {
  getQuestionById,
  incrementQuestionViews,
} from "../services/questions.service";

import {
  createQuestion,
  getAllQuestions,
  updateQuestion,
  deleteQuestion,
} from "../services/questions.service";
import { questionCreateSchema } from "../validators/questions.validators";
import { handleFormError } from "../util/errorHandler.util";

const getQuestionList = async (req: Request, res: Response): Promise<void> => {
  // if (!res.locals.isAuthenticated) {
  //   return res.status(401).render("shared/401");
  // }
  
  const questions = await getAllQuestions();
  res.render("questions/questionList", {
    questions,
  });

  
};
const getAskQuestion = async (req: Request, res: Response): Promise<void> => {
  res.render("questions/askQuestion");
};

const postAskQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedData = questionCreateSchema.parse(req.body);
    const user_id = req.session.user?.id!;
    const imageLocation = req.file ? `/images/uploads/${req.file.filename}` : null;

    
    await createQuestion(validatedData, user_id, imageLocation);
    res.redirect("/confirm");
  } catch (error) {
    handleFormError(error, req,"/questions");
    next(error);
    console.error("Error creating question:", error instanceof Error ? error.message : error);
  };
};


const getQuestionDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const question_id = parseInt(req.params.id as string);
  const question = await getQuestionById(question_id);
  console.log(question);

  if (!question) {
    return res.status(404).render("shared/404", {
      message: "Question not found",
    });
  }

  await incrementQuestionViews(question_id);

  res.render("questions/question-details", {
    question,
    canEdit: req.session.user?.id === question.user_id,
    currentUserId: req.session.user?.id || null,
  });
};


const getConfirm = (req: Request, res: Response): void => {
  res.render("questions/confirm");
};

const getEditQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  const question_id = parseInt(req.params.id as string);
  const question = await getQuestionById(question_id);

  if (!question) {
    return res.status(404).render("shared/404", {
      message: "Question not found",
    });
  }


  const errorMessage = req.session.errorMessage;
  req.session.errorMessage = "";
  const formData = req.session.formData || { ...question };

  res.render("questions/question-form", {
    question: formData,
    errorMessage,
    isEdit: true,
    formAction: `/questions/${question_id}/edit`,
    pageTitle: "Edit Question",
    buttonText: "Update Question",
  });
};

const postEditQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const question_id = parseInt(req.params.id as string);
  try {
    const question = await getQuestionById(question_id);
    if (!question) {
      return res.status(404).render("shared/404", {
        message: "Question not found",
      });
    }
    const imageLocation = req.file ? `/images/uploads/${req.file.filename}` : null;
    const validatedData = questionCreateSchema.parse({
      ...req.body,
      author_name: question.author_name,
    });
    await updateQuestion(question_id, validatedData, imageLocation);
    res.redirect(`/questions/${question_id}`);
  } catch (error) {
    handleFormError(error, req, `/questions/${question_id}/edit`);
    next(error);
  }
};


const postDeleteQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const question_id = parseInt(req.params.id as string);
  try {
    await deleteQuestion(question_id);
    res.redirect("/questions");
  } catch (error) {
    handleFormError(error, req, `/questions/${question_id}/edit`);
    next(error);
    // let errorMessage =
    //   "Failed to delete question: " +
    //   (error instanceof Error ? error.message : String(error));
    // req.session.errorMessage = errorMessage;
    // req.session.save(() => {
    //   res.redirect(`/questions/${question_id}`);
    // });
  }
};

export { getConfirm, getQuestionList, getAskQuestion, postAskQuestion, getQuestionDetails, getEditQuestion, postEditQuestion, postDeleteQuestion };
