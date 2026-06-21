import { z } from 'zod';

export const correctionSchema = z.object({
  route_id: z.string().min(1).max(100),
  leg_id: z.string().max(20).optional(),
  issue_type: z.enum([
    'wrong_landmark',
    'wrong_fare',
    'route_closed',
    'wrong_vehicle',
    'other',
  ]),
  description: z.string().max(500).optional(),
});

export const searchSchema = z.object({
  q: z.string().min(2).max(100),
  limit: z.coerce.number().min(1).max(20).default(8),
});

export const routeQuerySchema = z.object({
  from: z.string().min(1).max(100),
  to: z.string().min(1).max(100),
});

export type CorrectionInput = z.infer<typeof correctionSchema>;
