import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Projects — things built (mostly Astro)
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date().optional(),
    tag: z.string().optional(),
    url: z.string().url().optional(),
  }),
});

// Ronny Thoughts — the blog
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    url: z.string().url().optional(),
  }),
});

// Businesses — solo ventures
const businesses = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/businesses' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    employees: z.number().optional(),
    profit: z.string().optional(),
    url: z.string().url().optional(),
  }),
});

export const collections = { projects, blog, businesses };
