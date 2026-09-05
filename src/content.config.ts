import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

const knowledge = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/knowledge" }),
  schema: z.object({
    title: z.string().trim().min(1),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    description: z.string().default(''),
    tags: z.array(z.string()).default([]),
    topic: z.string().default('待整理'),
    type: z.enum(['日常', '学习', '工具', '方法', '随想']).default('学习'),
    sourceUrl: z.string().url().refine((value) => /^https?:\/\//i.test(value), '来源只支持 HTTP(S) 链接').optional(),
    draft: z.boolean().default(false),
    publish: z.boolean().optional(),
    visibility: z.string().optional(),
  }),
});

export const collections = { blog, knowledge };
