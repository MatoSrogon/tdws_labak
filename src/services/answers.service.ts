import Answer from "../models/answers.model";
import {
  AnswerCreateData,
  AnswerUpdateData,
} from "../validators/answers.validator";

const getAnswersByQuestion = async (question_id: number) => {
  return await Answer.findByQuestion(question_id);
};

const getAnswersByUser = async (user_id: number) => {
  return await Answer.findByUser(user_id);
};

const getAnswerById = async (id: number) => {
  return await Answer.findById(id);
};

const createAnswer = async (
  data: AnswerCreateData,
  question_id: number,
  user_id: number
): Promise<number> => {
  const answer = new Answer(question_id, user_id, data.comment);
  await answer.save();

  return answer.id!;
};

const updateAnswer = async (
  id: number,
  data: AnswerUpdateData
): Promise<void> => {
  const answer = await Answer.findById(id);

  if (!answer) {
    throw new Error("Answer not found");
  }

  if (data.comment) {
    answer.text = data.comment;
  }

  await answer.save();
};

const deleteAnswer = async (id: number): Promise<void> => {
  const answer = await Answer.findById(id);

  if (!answer) {
    throw new Error("Answer not found");
  }

  await answer.delete();
};

export {
  createAnswer,
  deleteAnswer,
  getAnswerById,
  getAnswersByQuestion,
  getAnswersByUser,
  updateAnswer,
};
