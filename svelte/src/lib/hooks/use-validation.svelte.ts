import type { ZodSchema } from 'zod';
import { formatValidationErrors } from '$lib/errors';

export function useValidation<T>(schema: ZodSchema<T>) {
	let errors = $state<Record<string, string>>({});

	function validate(data: unknown): data is T {
		const result = schema.safeParse(data);

		if (!result.success) {
			const zodErrors = result.error.errors.map((err) => ({
				field: err.path.join('.'),
				message: err.message
			}));
			errors = formatValidationErrors(zodErrors);
			return false;
		}

		errors = {};
		return true;
	}

	function clearErrors() {
		errors = {};
	}

	function setError(field: string, message: string) {
		errors = { ...errors, [field]: message };
	}

	return {
		get errors() {
			return errors;
		},
		validate,
		clearErrors,
		setError
	};
}
