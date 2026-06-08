import { z } from "zod";

const answerCreateSchema = z.object({
  comment: z.string().min(1, "Comment is required"),
});

const answerUpdateSchema = answerCreateSchema.partial();

type AnswerCreateData = z.infer<typeof answerCreateSchema>;
type AnswerUpdateData = z.infer<typeof answerUpdateSchema>;

export {
  AnswerCreateData,
  answerCreateSchema,
  AnswerUpdateData,
  answerUpdateSchema,
};
