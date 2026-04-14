import { defineCollection, z } from 'astro:content';

const houses = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    type: z.string(),               // e.g. "T2", "T3"
    tagline: z.string(),            // short descriptor shown on card
    capacity: z.number(),
    bedrooms: z.number(),
    badge: z.string().optional(),   // e.g. "Private Pool"
    privatePool: z.boolean().default(false),
    accessible: z.boolean().default(false),
    features: z.array(z.string()),
    bedroomDetail: z.string(),
    images: z.array(z.object({
      file: z.string(),
      alt: z.string(),
    })),
    order: z.number(),
  }),
});

const activities = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    icon: z.string(),
    price: z.string().optional(),
    order: z.number(),
  }),
});

const heritage = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    icon: z.string(),
    period: z.string(),
    location: z.string(),
    order: z.number(),
  }),
});

const testimonials = defineCollection({
  type: 'data',
  schema: z.object({
    author: z.string(),
    rating: z.number().min(1).max(5),
    text: z.string(),
    context: z.string(),   // e.g. "Stay at Christmas · Booking.com"
  }),
});

export const collections = { houses, activities, heritage, testimonials };
