import { z } from 'zod';

/**
 * Email Schema
 */
export const emailSchema = z.object({
	email: z.string().email('Invalid email address')
});

/**
 * Profile Update Schema
 */
export const profileUpdateSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(50, 'Name must be less than 50 characters'),
	image: z.string().optional()
});
