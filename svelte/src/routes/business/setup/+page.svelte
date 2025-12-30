<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import {
		LoaderCircle,
		Building2,
		Mail,
		Phone,
		Globe,
		FileText,
		Check,
		Lightbulb
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import type { BAUser } from '$lib/types/user';

	interface Props {
		data: {
			user: BAUser;
		};
	}

	const { data }: Props = $props();

	const { user } = data;

	// Form state
	let isSubmitting = $state(false);
	let currentStep = $state(1);

	let formData = $state({
		name: '',
		email: user.email || '', // Pre-fill with user's email
		phone: '',
		website: '',
		description: ''
	});

	// Clear onboarding flag when component mounts
	onMount(() => {
		sessionStorage.removeItem('onboarding_type');
	});

	// Validation
	const isStep1Valid = $derived(formData.name.trim().length > 0);
	const isStep2Valid = $derived(true); // Contact info is optional

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!formData.name.trim()) {
			toast.error('Business name is required');
			return;
		}

		isSubmitting = true;

		try {
			// Call API to create business account

			toast.success('Business account created!');

			// Redirect to dashboard
			await goto('/business/dashboard');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Something went wrong');
		} finally {
			isSubmitting = false;
		}
	}

	function nextStep() {
		if (currentStep === 1 && !isStep1Valid) {
			toast.error('Please enter your business name');
			return;
		}
		currentStep++;
	}

	function previousStep() {
		currentStep--;
	}

	function skipSetup() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Setup Business Account | Woofs Welcome</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
	<div class="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="text-center">
			<div class="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
				<Building2 class="text-primary h-8 w-8" />
			</div>
			<h1 class="mt-6 text-3xl font-bold tracking-tight text-gray-900">
				Welcome to Woofs Welcome, {user.name}!
			</h1>
			<p class="mt-2 text-sm text-gray-600">
				Let's set up your business account in just a few steps
			</p>
		</div>

		<!-- Progress Steps -->
		<div class="mt-12">
			<div class="flex items-center justify-center">
				<div class="flex items-center">
					<!-- Step 1 -->
					<div class="flex items-center">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full {currentStep >= 1
								? 'bg-primary text-white'
								: 'bg-gray-200 text-gray-500'}"
						>
							{#if currentStep > 1}
								<Check class="h-5 w-5" />
							{:else}
								<span class="text-sm font-semibold">1</span>
							{/if}
						</div>
						<span
							class="ml-2 hidden text-sm font-medium sm:block {currentStep >= 1
								? 'text-gray-900'
								: 'text-gray-500'}"
						>
							Business Info
						</span>
					</div>

					<!-- Connector -->
					<div class="mx-4 h-0.5 w-16 {currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}"></div>

					<!-- Step 2 -->
					<div class="flex items-center">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full {currentStep >= 2
								? 'bg-primary text-white'
								: 'bg-gray-200 text-gray-500'}"
						>
							{#if currentStep > 2}
								<Check class="h-5 w-5" />
							{:else}
								<span class="text-sm font-semibold">2</span>
							{/if}
						</div>
						<span
							class="ml-2 hidden text-sm font-medium sm:block {currentStep >= 2
								? 'text-gray-900'
								: 'text-gray-500'}"
						>
							Contact Details
						</span>
					</div>

					<!-- Connector -->
					<div class="mx-4 h-0.5 w-16 {currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}"></div>

					<!-- Step 3 -->
					<div class="flex items-center">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full {currentStep >= 3
								? 'bg-primary text-white'
								: 'bg-gray-200 text-gray-500'}"
						>
							<span class="text-sm font-semibold">3</span>
						</div>
						<span
							class="ml-2 hidden text-sm font-medium sm:block {currentStep >= 3
								? 'text-gray-900'
								: 'text-gray-500'}"
						>
							Review
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Form Card -->
		<Card class="mt-8">
			<CardHeader>
				<CardTitle>
					{#if currentStep === 1}
						Business Information
					{:else if currentStep === 2}
						Contact Details
					{:else}
						Review & Confirm
					{/if}
				</CardTitle>
				<CardDescription>
					{#if currentStep === 1}
						Tell us about your dog-friendly business
					{:else if currentStep === 2}
						How can customers reach you? (Optional)
					{:else}
						Review your information before creating your account
					{/if}
				</CardDescription>
			</CardHeader>

			<CardContent class="space-y-6">
				<form onsubmit={currentStep === 3 ? handleSubmit : nextStep}>
					<!-- Step 1: Business Info -->
					{#if currentStep === 1}
						<div class="space-y-6">
							<!-- Business Name -->
							<div class="space-y-2">
								<Label for="name" class="flex items-center gap-2">
									<Building2 class="h-4 w-4 text-gray-500" />
									Business Name <span class="text-red-500">*</span>
								</Label>
								<Input
									id="name"
									type="text"
									required
									bind:value={formData.name}
									placeholder="e.g., Bark & Brew Cafe"
									class="text-base"
									autofocus
								/>
								<p class="text-xs text-gray-500">
									This will be displayed on your business profile and listings
								</p>
							</div>

							<!-- Description -->
							<div class="space-y-2">
								<Label for="description" class="flex items-center gap-2">
									<FileText class="h-4 w-4 text-gray-500" />
									Business Description
								</Label>
								<Textarea
									id="description"
									bind:value={formData.description}
									placeholder="Tell dog owners what makes your business special. Highlight your dog-friendly features, amenities, and what sets you apart..."
									rows={5}
									maxlength={500}
									class="resize-none text-base"
								/>
								<p class="text-xs text-gray-500">
									{formData.description.length}/500 characters
								</p>
							</div>
						</div>
					{/if}

					<!-- Step 2: Contact Details -->
					{#if currentStep === 2}
						<div class="space-y-6">
							<p class="text-sm text-gray-600">
								Add contact information to help customers reach you. All fields are optional.
							</p>

							<!-- Email -->
							<div class="space-y-2">
								<Label for="email" class="flex items-center gap-2">
									<Mail class="h-4 w-4 text-gray-500" />
									Business Email
								</Label>
								<Input
									id="email"
									type="email"
									bind:value={formData.email}
									placeholder="contact@barkbrew.co.nz"
									class="text-base"
								/>
								<p class="text-xs text-gray-500">Public email for customer inquiries</p>
							</div>

							<!-- Phone -->
							<div class="space-y-2">
								<Label for="phone" class="flex items-center gap-2">
									<Phone class="h-4 w-4 text-gray-500" />
									Phone Number
								</Label>
								<Input
									id="phone"
									type="tel"
									bind:value={formData.phone}
									placeholder="+64 21 123 4567"
									class="text-base"
								/>
								<p class="text-xs text-gray-500">
									Include country code for international customers
								</p>
							</div>

							<!-- Website -->
							<div class="space-y-2">
								<Label for="website" class="flex items-center gap-2">
									<Globe class="h-4 w-4 text-gray-500" />
									Website
								</Label>
								<Input
									id="website"
									type="url"
									bind:value={formData.website}
									placeholder="https://barkbrew.co.nz"
									class="text-base"
								/>
								<p class="text-xs text-gray-500">Your business website or social media page</p>
							</div>
						</div>
					{/if}

					<!-- Step 3: Review -->
					{#if currentStep === 3}
						<div class="space-y-6">
							<div class="rounded-lg bg-gray-50 p-6">
								<!-- Business Name -->
								<div class="mb-4">
									<p class="text-sm font-medium text-gray-500">Business Name</p>
									<p class="mt-1 text-base font-semibold text-gray-900">{formData.name}</p>
								</div>

								<!-- Description -->
								{#if formData.description}
									<div class="mb-4">
										<p class="text-sm font-medium text-gray-500">Description</p>
										<p class="mt-1 text-sm text-gray-700">{formData.description}</p>
									</div>
								{/if}

								<!-- Contact Info -->
								<div class="border-t border-gray-200 pt-4">
									<p class="mb-3 text-sm font-medium text-gray-500">Contact Information</p>

									<div class="space-y-2 text-sm">
										{#if formData.email}
											<div class="flex items-center gap-2">
												<Mail class="h-4 w-4 text-gray-400" />
												<span class="text-gray-700">{formData.email}</span>
											</div>
										{/if}

										{#if formData.phone}
											<div class="flex items-center gap-2">
												<Phone class="h-4 w-4 text-gray-400" />
												<span class="text-gray-700">{formData.phone}</span>
											</div>
										{/if}

										{#if formData.website}
											<div class="flex items-center gap-2">
												<Globe class="h-4 w-4 text-gray-400" />
												<a
													href={formData.website}
													target="_blank"
													rel="noopener noreferrer"
													class="text-primary hover:underline"
												>
													{formData.website}
												</a>
											</div>
										{/if}

										{#if !formData.email && !formData.phone && !formData.website}
											<p class="italic text-gray-500">No contact information provided</p>
										{/if}
									</div>
								</div>
							</div>

							<div class="rounded-lg bg-blue-50 p-4">
								<p class=" text-sm text-blue-800">
									You can update all of this information later from your business dashboard
									settings.
								</p>
							</div>
						</div>
					{/if}

					<!-- Navigation Buttons -->
					<div class="flex items-center justify-between pt-6">
						<div>
							{#if currentStep !== 1}
								<Button
									type="button"
									variant="outline"
									onclick={previousStep}
									disabled={isSubmitting}
								>
									← Back
								</Button>
						
							{/if}
						</div>

						<div class="flex gap-2">
							{#if currentStep < 3}
								<Button
									type="submit"
									disabled={isSubmitting || (currentStep === 1 && !isStep1Valid)}
								>
									Continue →
								</Button>
							{:else}
								<Button type="submit" disabled={isSubmitting} class="min-w-40">
									{#if isSubmitting}
										<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
										Creating...
									{:else}
										Create Business Account
									{/if}
								</Button>
							{/if}
						</div>
					</div>
				</form>
			</CardContent>
		</Card>

		<!-- Help text -->
		<p class="mt-6 text-center text-sm text-gray-500">
			Need help? <a
				href="mailto:support@woofswelcome.nz"
				class="text-primary font-semibold hover:underline">Contact our support team</a
			>
		</p>
	</div>
</div>
