import { z } from "zod";

export const templateSchema = z.object({
  name: z
    .string()
    .min(3, "Template name must be at least 3 characters")
    .max(50, "Template name cannot exceed 50 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Template name must be lowercase (a-z, 0-9, _ only)",
    ),

  language: z.string().min(1, "Language required"),

  header: z.string().max(60).optional(),
  headerType: z.enum(["TEXT", "IMAGE", "VIDEO", "DOCUMENT", "NONE"]).optional(),
  headerImage: z.any().nullable().optional(),
  headerVideo: z.any().nullable().optional(),
  headerDocument: z.any().nullable().optional(),

  body: z.string().min(10, "Body must be at least 10 characters").max(1024),

  footer: z.string().max(60).optional(),

  headerVariables: z.array(z.string()).optional(),
  bodyVariables: z.array(z.string()).optional(),

  // variables: z.array(
  //   z.object({
  //     key: z.string(),
  //     sample: z.string().min(1, "Sample value required"),
  //   }),
  // ),

  // buttons: z.array(
  //   z.object({
  //     type: z.enum(["visit", "quick"]),
  //     text: z.string().min(1).max(25),
  //     url: z.string().optional(),
  //   }),
  // ),
});
