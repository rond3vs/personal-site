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
    category: z.enum(['App', 'Website', 'Music', 'Video', 'Coding']).default('Coding'),
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
    // Lessons — life lessons learned · Hunches — bets on the future · Rants — random thoughts
    category: z.enum(['Lessons', 'Hunches', 'Rants']).default('Rants'),
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

// My 5 — curated lists of my 5 favorite, underrated, overrated & goated items
const my5 = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/my5' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['Show', 'Movie', 'Anime', 'Cartoon', 'Gadget', 'Meme', 'Misc', 'Music', 'Stationery', 'Food', 'Book', 'Game', 'Podcast', 'Software', 'Brand']),
    tier: z.union([
      z.enum(['Favorite', 'Underrated']),
      z.array(z.enum(['Favorite', 'Underrated']))
    ]),
    url: z.string().url().optional(),
    rank: z.number().min(1).max(5),
    overallRank: z.number().min(1).max(5).optional(),
  }),
});

export const collections = { projects, blog, businesses, my5 };
