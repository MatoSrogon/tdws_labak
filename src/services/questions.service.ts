import Question from "../models/questions.model";
import { QuestionCreateData } from "../validators/questions.validators";

const getAllQuestions = async () => {
  return await Question.findAll();
};

const getQuestionById = async (question_id: number) => {
  return await Question.findById(question_id);
};

const incrementQuestionViews = async (question_id: number) => {
  await Question.incrementViews(question_id);
};

const createQuestion = async (
  data: QuestionCreateData,
  user_id: number,
  imageLocation: string | null = null,
): Promise<number> => {
  const question = new Question(
    data.challengeTitle,
    data.description,
    data.author_name,
    user_id,
    data.votes ?? 0,
    data.views ?? 0,
    undefined,
    undefined,
    imageLocation
  );

  await question.save();

  return question.id!;
};

const updateQuestion = async (
  question_id: number,
  data: QuestionCreateData,
  imageLocation: string | null = null
): Promise<void> => {
  const question = await Question.findById(question_id);

  if (!question) {
    throw new Error("Question not found");
  }
  
  const updateData: any = {
    title: data.challengeTitle,
    description: data.description,
    imageLocation,
  };

  if (imageLocation) {
    updateData.imageLocation = imageLocation;
  }

  question.merge(updateData);



  await question.save();
};

const deleteQuestion = async (question_id: number): Promise<void> => {
  const question = await Question.findById(question_id);

  if (!question) {
    throw new Error("Question not found");
  }

  await question.delete();
};

export { 
  createQuestion,
  getAllQuestions,
  getQuestionById,
  incrementQuestionViews,
  updateQuestion,
  deleteQuestion
};