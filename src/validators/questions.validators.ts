import { z } from "zod";

/* Question (Otazka) */

const questionCreateSchema = z.object({
  challengeTitle: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(255),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(255),

  votes: z.coerce.number().int().default(0),

  views: z.coerce.number().int().default(0),
});

/* Answer (Odpoved) */

const answerCreateSchema = z.object({
  question_id: z.coerce
    .number()
    .int()
    .positive("Question ID must be valid"),

  text: z
    .string()
    .min(1, "Answer text cannot be empty"),
});

/* Types */

type QuestionCreateData = z.infer<typeof questionCreateSchema>;
type AnswerCreateData = z.infer<typeof answerCreateSchema>;

export {
  questionCreateSchema,
  answerCreateSchema,
  type QuestionCreateData,
  type AnswerCreateData,
};