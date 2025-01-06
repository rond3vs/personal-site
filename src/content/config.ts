import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional()
  }),
});

const work = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    role: z.string(),
    dateStart: z.coerce.date(),
    dateEnd: z.union([z.coerce.date(), z.string()]),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    demoURL: z.string().optional(),
    repoURL: z.string().optional()
  }),
});

const businesses = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    revenue: z.number().min(0, "Revenue cannot be negative"),
    employees: z.number().int().min(0, "Number of employees cannot be negative"), 
    website: z.string().url().optional(),
  }),
});

export const collections = { blog, work, projects, businesses };
