import { z } from "zod";

export const createTaskSchema =
  z.object({
    title: z
      .string()
      .min(
        3,
        "Title must be at least 3 characters"
      ),

    description:
      z.string().optional(),

    priority: z.enum([
      "LOW",
      "MEDIUM",
      "HIGH",
    ]),

    assignee:
      z.string(),

    dueDate: z
      .string()
      .refine(
        (date) =>
          new Date(date) >
          new Date(),
        {
          message:
            "due_date must be a future date",
        }
      ),

    projectId:
      z.string(),
  });