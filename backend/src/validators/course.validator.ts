import { z } from "zod";

export const courseSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    shortDescription: z.string().optional(),
    thumbnail: z.string().optional(),
    price: z.coerce.number().min(0).default(0),
    discountPrice: z.coerce.number().min(0).optional(),
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
    language: z.string().default("English"),
    duration: z.coerce.number().min(0).default(0),
    categoryId: z.string().min(1),
    learningOutcomes: z.array(z.string()).optional(),
    prerequisites: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional()
  })
});

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    icon: z.string().optional(),
    status: z.string().default("active")
  })
});

export const sectionSchema = z.object({
  body: z.object({
    courseId: z.string(),
    title: z.string().min(2),
    orderNumber: z.coerce.number().int().min(1)
  })
});

export const lessonSchema = z.object({
  body: z.object({
    sectionId: z.string(),
    courseId: z.string(),
    title: z.string().min(2),
    content: z.string().optional(),
    videoUrl: z.string().optional(),
    pdfUrl: z.string().optional(),
    lessonType: z.enum(["VIDEO", "PDF", "TEXT", "LINK"]).default("TEXT"),
    duration: z.coerce.number().int().min(0).default(0),
    isPreview: z.coerce.boolean().default(false),
    orderNumber: z.coerce.number().int().min(1)
  })
});
