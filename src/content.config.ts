import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const locale = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({ pt: schema, en: schema });

const houses = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/houses' }),
  schema: z.object({
    name: z.string(),
    type: z.string(),
    capacity: z.number(),
    bedrooms: z.number(),
    privatePool: z.boolean().default(false),
    accessible: z.boolean().default(false),
    tagline:       locale(z.string()),
    badge:         locale(z.string()).optional(),
    features:      locale(z.array(z.string())),
    bedroomDetail: locale(z.string()),
    desc:          locale(z.string()),
    images: z.array(z.object({ file: z.string(), alt: z.string() })),
    order: z.number(),
  }),
});

const activities = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/activities' }),
  schema: z.object({
    name:  locale(z.string()),
    icon:  z.string(),
    price: locale(z.string()).optional(),
    desc:  locale(z.string()),
    order: z.number(),
  }),
});

const heritage = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/heritage' }),
  schema: z.object({
    name:     locale(z.string()),
    icon:     z.string(),
    period:   locale(z.string()),
    location: z.string(),
    desc:     locale(z.string()),
    badge:    z.string().optional(),
    order:    z.number(),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/testimonials' }),
  schema: z.object({
    author:  z.string(),
    rating:  z.number().min(1).max(5),
    text:    z.string(),
    context: z.string(),
  }),
});

export const collections = { houses, activities, heritage, testimonials };
