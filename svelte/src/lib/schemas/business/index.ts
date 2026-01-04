import { z } from 'zod';

/**
 * Business Schema
 */

// Create Business
export const createBusinessSchema = z.object({
	name: z.string().min(2, 'Name is required'),
	email: z.string().email('Invalid email address'),
	phone: z.string().optional(),
	website: z.string().url('Invalid URL'),
	description: z.string().optional(),
	logo: z.string().optional()
});

export type CreateBusinessBody = z.infer<typeof createBusinessSchema>;
