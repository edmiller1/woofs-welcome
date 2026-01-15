import { z } from 'zod';

export const claimFormSchema = z.object({
	// Step 1: Basic Information
	businessEmail: z.string().email('Please enter a valid email address'),
	businessPhone: z
		.string()
		.min(1, 'Phone number is required')
		.transform((val) => val.replace(/[\s\-\(\)]/g, ''))
		.pipe(z.string().regex(/^(\+64|0)[2-9]\d{7,9}$/, 'Please enter a valid phone number')),
	role: z.enum(['Owner', 'Manager', 'Marketing Manager', 'Staff', 'Other'], {
		required_error: 'Please select your role'
	}),
	// Step 2: Verification
	additionalNotes: z.string().optional(),
	verificationDocuments: z
		.array(z.instanceof(File))
		.min(1, 'Please upload at least one verification document')
		.max(10, 'You can upload a maximum of 10 files')
		.refine(
			(files) => files.every((file) => file.size <= 10 * 1024 * 1024),
			'Each file must be smaller than 10MB'
		)
		.refine(
			(files) =>
				files.every((file) =>
					[
						'application/pdf',
						'image/jpeg',
						'image/jpg',
						'image/png',
						'application/msword',
						'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
					].includes(file.type)
				),
			'Only PDF, JPG, PNG, and DOC files are allowed'
		),
	// Step 3: Terms & Conditions
	agreeToTerms: z.boolean().refine((val) => val === true, {
		message: 'You must agree to the terms and conditions'
	}),
	agreeToAccuracy: z.boolean().refine((val) => val === true, {
		message: 'You must confirm the accuracy of the information'
	}),
	agreeToOwnership: z.boolean().refine((val) => val === true, {
		message: 'You must confirm you are authorized to claim this place'
	})
});

export const step1Schema = claimFormSchema.pick({
	businessEmail: true,
	businessPhone: true,
	role: true
});

export const step2Schema = claimFormSchema.pick({
	additionalNotes: true,
	verificationDocuments: true
});

export const step3Schema = claimFormSchema.pick({
	agreeToTerms: true,
	agreeToAccuracy: true,
	agreeToOwnership: true
});

export type ClaimFormData = z.infer<typeof claimFormSchema>;
