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
    draft: z.boolean().optional(),
    url: z.string().url().optional(),
    // Lessons — life lessons learned · Hunches — bets on the future · Strays — random thoughts
    category: z.enum(['Lessons', 'Hunches', 'Strays']).default('Strays'),
    // Append-only timestamp history. Each `npm run stamp -- <post>` adds an entry
    // (newest first): the sha256 of the body at that moment + its Algorand txn.
    // Old entries are never removed, so the edit trail stays verifiable.
    proofs: z
      .array(
        z.object({
          date: z.coerce.date(),
          hash: z.string(),
          txn: z.string(),
        })
      )
      .optional(),
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

// Currently into — products, tools & things I'm using / playing / watching now
const currently = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/currently' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string().optional(),   // e.g. Using, Playing, Collecting, Watching
    url: z.string().url().optional(),
  }),
});

export const collections = { projects, blog, businesses, currently };
