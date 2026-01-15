<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardTitle } from '$lib/components/ui/card';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import type { ClaimRole } from '$lib/types/claim';
	import type { BAUser } from '$lib/types/user';
	import {
		ArrowLeft,
		ArrowRight,
		Building2,
		CircleAlert,
		CircleCheck,
		FileText,
		LoaderCircle,
		ShieldCheck,
		Upload,
		X
	} from '@lucide/svelte';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { step1Schema, step2Schema, step3Schema } from '$lib/schemas/claim';
	import ValidationError from '$lib/components/validation-error.svelte';
	import { getFileBase64 } from '$lib/helpers';

	interface Props {
		data: {
			user: BAUser;
			slug: string;
			searchParams: {
				[key: string]: string | string[] | undefined;
			};
		};
	}

	const { data }: Props = $props();
	const { user, slug, searchParams } = data;

	const place = createQuery({
		queryKey: ['place', slug],
		queryFn: () => api.place.getPlace(slug)
	});

	const submitClaim = createMutation({
		mutationFn: async (data: {
			placeSlug: string;
			businessId: string;
			businessEmail: string;
			businessPhone: string;
			role: ClaimRole;
			additionalNotes: string;
			verificationDocuments: Array<{ data: string; fileName: string }>;
		}) => api.claim.submitClaim(data),

		onSuccess: () => {
			toast.success("Claim submitted successfully! We'll review it shortly.");
			goto('/business/dashboard/claims');
		},
		onError: (error) => {
			console.log(error);
			toast.error('Failed to submit claim. Please try again.');
		}
	});

	// Multi-step state
	let currentStep = $state(1);
	const totalSteps = 3;

	// Form state
	let businessEmail = $state('');
	let businessPhone = $state('');
	let role = $state<ClaimRole>('Owner');
	let additionalNotes = $state('');
	let verificationFiles = $state<File[]>([]);

	// Terms checkboxes
	let agreeToTerms = $state(false);
	let agreeToAccuracy = $state(false);
	let agreeToOwnership = $state(false);

	// Validation errors - now using Record<string, string> to match your component
	let errors = $state<Record<string, string>>({});

	// Touched fields (to show errors only after user interaction)
	let touched = $state<Record<string, boolean>>({});

	const roleOptions: ClaimRole[] = ['Owner', 'Manager', 'Marketing Manager', 'Staff', 'Other'];

	// File upload handling
	const handleFileChange = (e: Event) => {
		const input = e.target as HTMLInputElement;
		if (input.files) {
			const newFiles = Array.from(input.files);
			verificationFiles = [...verificationFiles, ...newFiles];
			touched.verificationDocuments = true;
			validateStep2();
		}
	};

	const removeFile = (index: number) => {
		verificationFiles = verificationFiles.filter((_, i) => i !== index);
		if (touched.verificationDocuments) {
			validateStep2();
		}
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
	};

	// Validate step 1
	const validateStep1 = () => {
		const result = step1Schema.safeParse({
			businessEmail,
			businessPhone,
			role
		});

		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			result.error.errors.forEach((err) => {
				const field = err.path[0] as string;
				fieldErrors[field] = err.message;
			});
			errors = fieldErrors;
			return false;
		}

		errors = {};
		return true;
	};

	// Validate step 2
	const validateStep2 = () => {
		const result = step2Schema.safeParse({
			additionalNotes,
			verificationDocuments: verificationFiles
		});

		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			result.error.errors.forEach((err) => {
				const field = err.path[0] as string;
				fieldErrors[field] = err.message;
			});
			errors = fieldErrors;
			return false;
		}

		errors = {};
		return true;
	};

	// Validate step 3
	const validateStep3 = () => {
		const result = step3Schema.safeParse({
			agreeToTerms,
			agreeToAccuracy,
			agreeToOwnership
		});

		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			result.error.errors.forEach((err) => {
				const field = err.path[0] as string;
				fieldErrors[field] = err.message;
			});
			errors = fieldErrors;
			return false;
		}

		errors = {};
		return true;
	};

	// Mark field as touched
	const markTouched = (field: string) => {
		touched[field] = true;
		if (currentStep === 1) {
			validateStep1();
		}
	};

	// Step validation
	const isStep1Valid = (): boolean => {
		return validateStep1();
	};

	const isStep2Valid = (): boolean => {
		return validateStep2();
	};

	const isStep3Valid = (): boolean => {
		return validateStep3();
	};

	const canProceed = (): boolean => {
		if (currentStep === 1) return isStep1Valid();
		if (currentStep === 2) return isStep2Valid();
		if (currentStep === 3) return isStep3Valid();
		return false;
	};

	const nextStep = () => {
		// Validate current step
		let isValid = false;
		if (currentStep === 1) {
			isValid = validateStep1();
			if (!isValid) {
				// Mark all fields as touched to show errors
				touched.businessEmail = true;
				touched.businessPhone = true;
				touched.role = true;
				toast.error('Please fix the errors before continuing');
				return;
			}
		} else if (currentStep === 2) {
			isValid = validateStep2();
			if (!isValid) {
				touched.verificationDocuments = true;
				toast.error('Please fix the file upload errors before continuing');
				return;
			}
		}

		if (currentStep < totalSteps) {
			currentStep++;
		}
	};

	const previousStep = () => {
		if (currentStep > 1) {
			currentStep--;
		}
	};

	const handleSubmit = async () => {
		// Validate step 3
		if (!validateStep3()) {
			toast.error('Please accept all terms and conditions');
			return;
		}

		try {
			// Convert files to base64
			const verificationDocuments: Array<{ data: string; fileName: string }> = [];
			for (const file of verificationFiles) {
				const base64String = await getFileBase64(file);
				verificationDocuments.push({ data: base64String, fileName: file.name });
			}

			// Strip phone number formatting before sending
			const strippedPhone = businessPhone.replace(/[\s\-\(\)]/g, '');

			$submitClaim.mutate({
				placeSlug: slug,
				businessId: user.business.id,
				businessEmail: businessEmail,
				businessPhone: strippedPhone,
				role: role,
				additionalNotes: additionalNotes || '',
				verificationDocuments
			});
		} catch (error) {
			console.error('Error submitting claim:', error);
			toast.error('Failed to submit claim. Please try again.');
		}
	};

	const roleContent = $derived(roleOptions.find((r) => r === role) ?? 'Select a role');

	// Real-time validation on role change
	$effect(() => {
		if (touched.role && currentStep === 1) {
			validateStep1();
		}
	});
</script>

<svelte:head>
	<title>Claim {$place.data?.name} - Woofs Welcome</title>
</svelte:head>

{#if $place.isLoading}
	<div class="flex min-h-screen items-center justify-center">
		<LoaderCircle class="text-primary size-10 animate-spin" />
	</div>
{:else if $place.isError}
	<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
		Failed to load place. Please try again.
	</div>
{:else if $place.data}
	<div class="px-4 py-8">
		<Button variant="ghost" onclick={() => goto(`/place/${slug}`)}>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to {$place.data.name}
		</Button>
		<div class="container mx-auto max-w-4xl px-4 py-8">
			<!-- Header -->
			<div class="mb-8">
				<div class="mt-6">
					<h1 class="text-3xl font-bold">Claim Your Business</h1>
					<p class="text-muted-foreground mt-2">
						Verify your ownership of <strong class="text-foreground">{$place.data.name}</strong> to manage
						and update your place.
					</p>
				</div>
			</div>

			<!-- Progress Indicator -->
			<div class="mb-8">
				<div class="flex items-center justify-between">
					{#each Array(totalSteps) as _, i}
						{@const stepNum = i + 1}
						{@const isActive = stepNum === currentStep}
						{@const isCompleted = stepNum < currentStep}

						<div class="flex flex-1 items-center">
							<div class="flex flex-col items-center">
								<div
									class="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors {isActive
										? 'border-primary bg-primary text-primary-foreground'
										: isCompleted
											? 'border-primary bg-primary text-primary-foreground'
											: 'border-muted-foreground/30 bg-muted text-muted-foreground'}"
								>
									{#if isCompleted}
										<CircleCheck class="h-5 w-5" />
									{:else}
										{stepNum}
									{/if}
								</div>
								<span
									class="mt-2 text-xs font-medium {isActive
										? 'text-foreground'
										: 'text-muted-foreground'}"
								>
									{stepNum === 1 ? 'Information' : stepNum === 2 ? 'Verification' : 'Terms'}
								</span>
							</div>

							{#if stepNum < totalSteps}
								<div
									class="mx-2 h-0.5 flex-1 transition-colors {stepNum < currentStep
										? 'bg-primary'
										: 'bg-muted-foreground/30'}"
								></div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Step Content -->
			<Card>
				<CardHeader>
					<CardTitle
						>{#if currentStep === 1}
							<div class="flex items-center gap-2">
								<Building2 class="h-5 w-5" />
								Business Information
							</div>
						{:else if currentStep === 2}
							<div class="flex items-center gap-2">
								<FileText class="h-5 w-5" />
								Verification Documents
							</div>
						{:else}
							<div class="flex items-center gap-2">
								<ShieldCheck class="h-5 w-5" />
								Terms & Conditions
							</div>
						{/if}
					</CardTitle>
					<CardDescription>
						{#if currentStep === 1}
							Provide your business contact information
						{:else if currentStep === 2}
							Upload documents to verify your ownership
						{:else}
							Review and accept our terms and conditions
						{/if}
					</CardDescription>
				</CardHeader>

				<CardContent>
					{#if currentStep === 1}
						<!-- Step 1: Business Information -->
						<div class="space-y-6">
							<div class="space-y-2">
								<Label for="businessEmail">Business Email *</Label>
								<Input
									id="businessEmail"
									type="email"
									placeholder="business@example.com"
									bind:value={businessEmail}
									onblur={() => markTouched('businessEmail')}
									class={touched.businessEmail && errors.businessEmail ? 'border-destructive' : ''}
									required
								/>
								{#if touched.businessEmail}
									<ValidationError {errors} field="businessEmail" />
								{:else}
									<p class="text-muted-foreground text-sm">
										We'll use this email to contact you about this claim
									</p>
								{/if}
							</div>

							<div class="space-y-2">
								<Label for="businessPhone">Business Phone *</Label>
								<Input
									id="businessPhone"
									type="tel"
									placeholder="+64 21 123 4567"
									bind:value={businessPhone}
									onblur={() => markTouched('businessPhone')}
									class={touched.businessPhone && errors.businessPhone ? 'border-destructive' : ''}
									required
								/>
								{#if touched.businessPhone}
									<ValidationError {errors} field="businessPhone" />
								{:else}
									<p class="text-muted-foreground text-sm">A phone number where we can reach you</p>
								{/if}
							</div>

							<div class="space-y-2">
								<Label for="role">Your Role *</Label>
								<Select.Root type="single" bind:value={role}>
									<Select.Trigger class={touched.role && errors.role ? 'border-destructive' : ''}>
										{roleContent}
									</Select.Trigger>
									<Select.Content>
										{#each roleOptions as roleOption}
											<Select.Item value={roleOption}>{roleOption}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
								{#if touched.role}
									<ValidationError {errors} field="role" />
								{:else}
									<p class="text-muted-foreground text-sm">Your role at this business</p>
								{/if}
							</div>

							<Alert.Root>
								<CircleAlert class="h-4 w-4" />
								<Alert.Description>
									Make sure this information is accurate. We may use it to verify your claim.
								</Alert.Description>
							</Alert.Root>
						</div>
					{:else if currentStep === 2}
						<!-- Step 2: Verification Documents -->
						<div class="space-y-6">
							<div>
								<Label for="additionalNotes">Additional Notes</Label>
								<Textarea
									id="additionalNotes"
									placeholder="Any additional information that helps verify your ownership..."
									bind:value={additionalNotes}
									rows={4}
									class="mt-2"
								/>
							</div>
							<div class="space-y-3">
								<Label>Verification Documents *</Label>
								<p class="text-muted-foreground text-sm">
									Upload at least one document that proves your ownership or authorization to manage
									this place.
								</p>
								<div class="border-muted-foreground/25 rounded-lg border-2 border-dashed p-6">
									<div class="text-center">
										<Upload class="text-muted-foreground mx-auto h-12 w-12" />
										<div class="mt-4">
											<Label
												for="file-upload"
												class="text-primary flex cursor-pointer items-center justify-center text-sm font-medium hover:underline"
											>
												Upload files
											</Label>
											<Input
												id="file-upload"
												type="file"
												multiple
												accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
												onchange={handleFileChange}
												class="sr-only"
											/>
										</div>
										<p class="text-muted-foreground mt-1 text-xs">
											PDF, JPG, PNG, DOC up to 10MB each
										</p>
									</div>
								</div>

								<!-- Validation Error -->
								{#if touched.verificationDocuments}
									<ValidationError {errors} field="verificationDocuments" />
								{/if}

								<!-- Uploaded Files -->
								{#if verificationFiles.length > 0}
									<div class="mt-4 space-y-2">
										{#each verificationFiles as file, i}
											<div
												class="bg-muted/50 flex items-center justify-between rounded-lg border p-3"
											>
												<div class="flex items-center gap-3">
													<FileText class="text-muted-foreground h-5 w-5" />
													<div class="min-w-0 flex-1">
														<p class="truncate text-sm font-medium">{file.name}</p>
														<p class="text-muted-foreground text-xs">{formatFileSize(file.size)}</p>
													</div>
												</div>
												<Button variant="ghost" size="sm" onclick={() => removeFile(i)}>
													<X class="h-4 w-4" />
												</Button>
											</div>
										{/each}
									</div>
								{/if}

								<Alert.Root>
									<Alert.Description>
										<strong>Recommended documents:</strong> Business license, utility bill, tax documents,
										or any official documentation showing your connection to this place.
									</Alert.Description>
								</Alert.Root>
							</div>
						</div>
					{:else}
						<!-- Step 3: Terms & Conditions -->
						<div class="space-y-6">
							<div class="bg-muted rounded-lg p-4">
								<h3 class="font-semibold">Before you submit your claim</h3>
								<p class="text-muted-foreground mt-2 text-sm">
									Please review and accept the following terms to complete your claim submission.
								</p>
							</div>

							<div class="space-y-4">
								<div class="space-y-2">
									<div class="flex items-start space-x-3">
										<Checkbox id="terms" bind:checked={agreeToTerms} />
										<div class="space-y-1 leading-none">
											<Label for="terms" class="cursor-pointer font-normal">
												I agree to the
												<a href="/terms" class="text-primary hover:underline" target="_blank"
													>Terms of Service</a
												>
												and
												<a href="/privacy" class="text-primary hover:underline" target="_blank"
													>Privacy Policy</a
												>
											</Label>
										</div>
									</div>
									<ValidationError {errors} field="agreeToTerms" />
								</div>

								<div class="space-y-2">
									<div class="flex items-start space-x-3">
										<Checkbox id="accuracy" bind:checked={agreeToAccuracy} />
										<div class="space-y-1 leading-none">
											<Label for="accuracy" class="cursor-pointer font-normal">
												I certify that all information provided is accurate and truthful
											</Label>
										</div>
									</div>
									<ValidationError {errors} field="agreeToAccuracy" />
								</div>

								<div class="space-y-2">
									<div class="flex items-start space-x-3">
										<Checkbox id="ownership" bind:checked={agreeToOwnership} />
										<div class="space-y-1 leading-none">
											<Label for="ownership" class="cursor-pointer font-normal">
												I confirm that I am authorized to claim and manage this business listing
											</Label>
										</div>
									</div>
									<ValidationError {errors} field="agreeToOwnership" />
								</div>
							</div>

							<Alert.Root>
								<ShieldCheck class="h-4 w-4" />
								<Alert.Description>
									<strong>What happens next?</strong>
									<ul class="mt-2 space-y-1 text-sm">
										<li>• We'll review your claim within 24-48 hours</li>
										<li>• You'll receive an email notification when your claim is processed</li>
										<li>• Once approved, you can manage your place and respond to reviews</li>
									</ul>
								</Alert.Description>
							</Alert.Root>
						</div>
					{/if}
				</CardContent>
			</Card>

			<!-- Navigation Buttons -->
			<div class="mt-6 flex items-center justify-between">
				<Button
					variant="outline"
					onclick={previousStep}
					disabled={currentStep === 1 || $submitClaim.isPending}
				>
					<ArrowLeft class="mr-2 h-4 w-4" />
					Previous
				</Button>

				{#if currentStep < totalSteps}
					<Button onclick={nextStep}>
						Next
						<ArrowRight class="ml-2 h-4 w-4" />
					</Button>
				{:else}
					<Button onclick={handleSubmit} disabled={$submitClaim.isPending}>
						{#if $submitClaim.isPending}
							<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						{$submitClaim.isPending ? 'Submitting...' : 'Submit Claim'}
					</Button>
				{/if}
			</div>
		</div>
	</div>
{/if}
