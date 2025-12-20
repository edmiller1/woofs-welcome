import { z } from 'zod';

export const reviewFormSchema = z.object({
	// Core fields
	rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5'),
	title: z
		.string()
		.min(10, 'Review must be at least 10 characters')
		.max(30, 'Review must be less than 30 characters'),
	content: z
		.string()
		.min(10, 'Review must be at least 10 characters')
		.max(1000, 'Review must be less than 1000 characters'),
	visitDate: z.string({ required_error: 'Visit date is required' }),

	// Dog details
	numDogs: z.number().min(1, 'Must have at least 1 dog').max(10, 'Maximum 10 dogs allowed'),
	dogBreeds: z.array(z.string()).min(1, 'Please select at least one dog breed'),
	timeOfVisit: z.enum(['morning', 'afternoon', 'evening'], {
		required_error: 'Please select time of visit'
	}),

	isFirstVisit: z.boolean().default(true),
	images: z.array(z.string()).max(6, 'Maximum 6 images allowed'),
	placeId: z.string({ required_error: 'Place ID is required' }),
	placeSlug: z.string({ required_error: 'Place slug is required' })
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;

export const getReviewSchemaForPlace = (placeTypes: string[]) => {
	const hasRestaurant = placeTypes.some((type) => ['Restaurant', 'Café', 'Bar'].includes(type));
	const hasAccommodation = placeTypes.some((type) => ['Hotel', 'Motel', 'AirBnb'].includes(type));
	const hasOutdoorSpace = placeTypes.some((type) =>
		['Park', 'Dog Park', 'Beach', 'Trail', 'Walk', 'Hike'].includes(type)
	);

	const requiresStaffRating = hasRestaurant || hasAccommodation;

	const conditionalSchema = z.object({
		// Core fields
		rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5'),
		content: z
			.string()
			.min(10, 'Review must be at least 10 characters')
			.max(1000, 'Review must be less than 1000 characters'),
		visitDate: z
			.date({ required_error: 'Visit date is required' })
			.max(new Date(), 'Visit date cannot be in the future'),

		// Dog details
		numDogs: z.number().min(1, 'Must have at least 1 dog').max(10, 'Maximum 10 dogs allowed'),
		dogBreeds: z.array(z.string()).min(1, 'Please select at least one dog breed'),
		timeOfVisit: z.enum(['morning', 'afternoon', 'evening'], {
			required_error: 'Please select time of visit'
		}),

		// Experience fields
		wouldRecommendForDogs: z.boolean().default(true),
		isFirstVisit: z.boolean().default(true),

		// Staff rating (conditional)
		staffFriendlinessRating: requiresStaffRating
			? z.number().min(1, 'Staff rating is required').max(5)
			: z.number().min(1).max(5).optional(),

		// Dog amenities (conditional based on place type)
		hadWaterBowls: z.boolean().optional(),
		hadDogTreats: z.boolean().optional(),
		hadDogArea: z.boolean().optional(),
		hadDogMenu: z.boolean().optional()
	});

	return {
		schema: conditionalSchema,
		showStaffRating: requiresStaffRating,
		showDogMenu: hasRestaurant,
		showDogArea: hasOutdoorSpace,
		showWaterBowls: true,
		showDogTreats: hasRestaurant || hasAccommodation
	};
};

export const editReviewSchema = z
	.object({
		placeId: z.string().uuid('Invalid place ID'),
		placeSlug: z.string().min(1, 'Place slug is required'),
		rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
		title: z
			.string()
			.min(10, 'Title must be at least 10 characters')
			.max(100, 'Title must be less than 100 characters'),
		content: z
			.string()
			.min(20, 'Review content must be at least 20 characters')
			.max(2000, 'Review content must be less than 2000 characters'),
		visitDate: z.string().date('Invalid date format'),
		numDogs: z.number().int().min(1).max(10, 'Number of dogs must be between 1 and 10'),
		dogBreeds: z
			.array(z.string())
			.min(1, 'At least one dog breed is required')
			.max(6, 'Maximum 6 dog breeds allowed'),
		timeOfVisit: z.enum(['morning', 'afternoon', 'evening'], {
			errorMap: () => ({ message: 'Invalid time of visit' })
		}),
		isFirstVisit: z.boolean(),
		existingImageCount: z.number().int().min(0).optional().default(0),
		newImages: z.array(z.string()).optional().default([]),
		imagesToDelete: z.array(z.string()).optional().default([])
	})
	.refine(
		(data) => {
			const remainingExisting = data.existingImageCount - (data.imagesToDelete?.length || 0);
			const newImagesCount = data.newImages?.length || 0;
			const totalImages = remainingExisting + newImagesCount;

			return totalImages <= 6;
		},
		{
			message:
				'Total images cannot exceed 6. Please remove some existing images before adding new ones.',
			path: ['newImages']
		}
	);

export type EditReviewFormData = z.infer<typeof editReviewSchema>;
