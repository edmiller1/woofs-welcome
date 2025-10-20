import { z } from 'zod';

/**
 * Review Form Schema
 */
export const reviewFormSchema = z.object({
	placeId: z.string().uuid('Invalid place ID'),
	placeSlug: z.string().min(1, 'Place slug is required'),
	rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5'),
	title: z
		.string()
		.min(10, 'Title must be at least 10 characters')
		.max(100, 'Title must be less than 100 characters'),
	content: z
		.string()
		.min(50, 'Review must be at least 50 characters')
		.max(2000, 'Review must be less than 2000 characters'),
	visitDate: z.string().datetime('Invalid date'),
	numDogs: z.number().int().min(1).max(10, 'Number of dogs must be between 1 and 10'),
	dogBreeds: z
		.array(z.string())
		.min(1, 'At least one dog breed is required')
		.max(6, 'Maximum 6 dog breeds allowed'),
	timeOfVisit: z.enum(['morning', 'afternoon', 'evening']),
	isFirstVisit: z.boolean(),
	images: z.array(z.string()).max(6, 'Maximum 6 images allowed').optional().default([])
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;

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

/**
 * Report Review Schema
 */
export const reportReviewSchema = z.object({
	reason: z.enum(
		[
			'sexuallyExplicit',
			'hateSpeech',
			'violence',
			'falseInformation',
			'notPersonal',
			'wrongPlace',
			'spam',
			'other'
		],
		{
			errorMap: () => ({ message: 'Please select a reason' })
		}
	),
	details: z.string().max(500, 'Details must be less than 500 characters').optional().default('')
});
