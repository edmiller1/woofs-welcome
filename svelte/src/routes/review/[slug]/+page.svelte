<script lang="ts">
	import { api } from '$lib/api/index.js';
	import { CalendarIcon, Dog, ImagePlus, Loader2, MapPin, Star, X } from '@lucide/svelte';
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import Label from '$lib/components/ui/label/label.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select/index.js';
	import type { Breed, ErrorResponse } from '$lib/types/models.js';
	import { Badge } from '$lib/components/ui/badge';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils';
	import {
		CalendarDate,
		DateFormatter,
		getLocalTimeZone,
		parseDate,
		today,
		type DateValue
	} from '@internationalized/date';
	import { generateUID, getFileBase64 } from '$lib/helpers';
	import { toast } from 'svelte-sonner';
	import { reviewFormSchema, type ReviewFormData } from '$lib/schemas.js';
	import { goto } from '$app/navigation';
	import type { AxiosError } from 'axios';

	let { data } = $props();
	const user = $derived(data.user);

	const queryClient = useQueryClient();

	const place = createQuery({
		queryKey: ['place', data.slug],
		queryFn: () => api.place.getPlace(data.slug)
	});

	const breeds = createQuery({
		queryKey: ['breeds'],
		queryFn: () => api.review.getBreeds()
	});

	const createReview = createMutation({
		mutationFn: (newReview: ReviewFormData) => api.review.createReview(newReview),
		onSuccess: (newReviewData) => {
			toast.success('Review submitted successfully!');

			queryClient.invalidateQueries({ queryKey: ['place', newReviewData.placeSlug] });

			if (window.opener && !window.opener.closed && window) {
				window.postMessage(
					{
						type: 'REVIEW_SUBMITTED',
						placeId: newReviewData.placeId,
						placeSlug: newReviewData.placeSlug
					},
					window.location.origin
				);

				window.opener.focus();
				window.close();
			} else {
				goto(`/place/${newReviewData.placeSlug}`);
			}

			if (newReviewData.reviewId && formData.images.length > 0) {
				setTimeout(() => {
					toast.info('Review images should be ready now. Refresh to see them!');

					queryClient.invalidateQueries({
						queryKey: ['place', newReviewData.placeSlug]
					});
				}, 15000);
			}
		},
		onError: (error: AxiosError<ErrorResponse>) => {
			console.log(error);
			if (error.response?.data.error) {
				toast.error(error.response.data.error);
			} else {
				toast.error('Failed to submit review. Please try again.');
			}
		}
	});

	let formData = $state({
		rating: 0,
		title: '',
		content: '',
		visitDate: '',
		numDogs: 1,
		dogBreeds: [] as string[],
		timeOfVisit: '',
		isFirstVisit: true,
		images: [] as { id: string; url: string; index: number; base64Value: string }[]
	});
	let termsChecked = $state<boolean>(false);

	let errors = $state<Record<string, string>>({});
	let hoveredRating: number = $state(0);
	let filteredBreeds = $state<Breed[] | undefined>([]);
	let search = $state<string>('');

	const timeOptions = [
		{ value: 'morning', label: 'Morning', time: '6AM - 12PM', icon: '🌅' },
		{ value: 'afternoon', label: 'Afternoon', time: '12PM - 6PM', icon: '☀️' },
		{ value: 'evening', label: 'Evening', time: '6PM - 12AM', icon: '🌆' }
	];

	$effect(() => {
		if (search) {
			filteredBreeds = $breeds.data?.breeds?.filter((breed) =>
				breed.name.toLowerCase().includes(search.toLowerCase())
			);
		} else {
			filteredBreeds = $breeds.data?.breeds;
		}
	});

	function handleRatingClick(rating: number) {
		formData.rating = rating;
		if (errors.rating) delete errors.rating;
	}

	function handleTimeOfVisitToggle(timeOfVisit: string) {
		if (formData.timeOfVisit === timeOfVisit) {
			formData.timeOfVisit = '';
		} else {
			formData.timeOfVisit = timeOfVisit;
		}
		if (errors.timeOfVisit) delete errors.timeOfVisit;
	}

	function removeImage(id: string) {
		formData.images = formData.images.filter((image) => image.id !== id);
	}

	function validateForm(): boolean {
		const newErrors: Record<string, string> = {};

		if (formData.rating < 1 || formData.rating > 5) {
			newErrors.rating = 'Rating is required';
		}
		if (formData.title.length < 10 || formData.title.length > 30) {
			newErrors.title = 'Title must be between 10-30 characters';
		}
		if (formData.content.length < 10 || formData.content.length > 1000) {
			newErrors.content = 'Review must be between 10-1000 characters';
		}
		if (!formData.visitDate) {
			newErrors.visitDate = 'Visit date is required';
		}
		if (formData.numDogs < 1 || formData.numDogs > 10) {
			newErrors.numDogs = 'Must have between 1-10 dogs';
		}
		if (formData.dogBreeds.length === 0) {
			newErrors.dogBreeds = 'Please select at least one dog breed';
		}
		if (!formData.timeOfVisit) {
			newErrors.timeOfVisit = 'Please select time of visit';
		}
		if (formData.images.length > 6) {
			newErrors.images = 'Maximum 6 images allowed';
		}

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	const handleDragOver = (e: HTMLElementEventMap['dragover']) => {
		e.preventDefault();
	};

	const handleDrop = async (e: HTMLElementEventMap['drop']) => {
		e.preventDefault();
		e.stopPropagation();

		const files = Array.from(e.dataTransfer?.files || []);
		const newImages = await Promise.all(
			files.map(async (file, index) => {
				const base64String = await getFileBase64(file);
				return {
					id: generateUID(),
					url: URL.createObjectURL(file),
					index: index,
					base64Value: base64String
				};
			})
		);

		if (formData.images.length + files.length > 6) {
			toast.warning('Maximum of 6 images allowed');
			return;
		}

		formData.images = [...formData.images, ...newImages];
	};

	const handleImageSelect = async (e: Event) => {
		e.preventDefault();
		e.stopPropagation();

		if (!e.target) return;

		const target = e.target as HTMLInputElement;
		const files = Array.from(target.files || []);

		const newImages = await Promise.all(
			files.map(async (file, index) => {
				const base64String = await getFileBase64(file);
				return {
					id: generateUID(),
					url: URL.createObjectURL(file),
					index: index,
					base64Value: base64String
				};
			})
		);

		if (formData.images.length + files.length > 6) {
			toast.warning('Maximum of 6 images allowed');
			return;
		}

		formData.images = [...formData.images, ...newImages];
	};

	function handleSubmit() {
		if (validateForm()) {
			console.log('Form submitted:', formData);
			const reviewData = reviewFormSchema.parse({
				...formData,
				placeId: $place.data?.id!,
				placeSlug: data.slug,
				images: formData.images.map((image) => image.base64Value)
			});
			$createReview.mutate(reviewData);
			// Handle form submission here
			// You would typically call your API endpoint here
		}
	}

	const df = new DateFormatter('en-AU', {
		dateStyle: 'long'
	});

	let visitDate = $derived(formData.visitDate ? parseDate(formData.visitDate) : undefined);
</script>

{#if $place.isError}
	<div>Error</div>
{/if}

{#if $place.isLoading}
	<div class="flex min-h-screen items-center justify-center">
		<Loader2 class="text-primary size-10 animate-spin" />
	</div>
{/if}

{#if $place.isSuccess}
	<div class="min-h-screen bg-[#fefaf5] px-4 py-8">
		<div class="mx-auto max-w-2xl">
			<!-- Header -->
			<div class="mb-8 text-center">
				<div class="mb-4 flex items-center justify-center">
					<div class="rounded-full bg-blue-500 p-3">
						<Dog class="h-8 w-8 text-white" />
					</div>
				</div>
				<h1 class="mb-2 text-3xl font-bold text-gray-900">Share Your Experience</h1>
				<p class="text-gray-600">Share your experience with other dog owners</p>
				<div class="mt-4 flex items-center justify-center text-sm text-gray-500">
					<MapPin class="mr-1 h-4 w-4" />
					<span>{$place.data.address}</span>
				</div>
			</div>

			<Card.Root class="shadow-xl">
				<Card.Content class="space-y-8 p-6 md:p-8">
					<!-- Rating Section -->
					<div class="space-y-3">
						<Label class="text-lg font-semibold">Overall Rating *</Label>
						<div class="flex items-center gap-2">
							{#each [1, 2, 3, 4, 5] as star}
								<button
									type="button"
									onclick={() => handleRatingClick(star)}
									onmouseenter={() => (hoveredRating = star)}
									onmouseleave={() => (hoveredRating = 0)}
									class="p-1 transition-transform hover:scale-110"
								>
									<Star
										class="h-8 w-8 {star <= (hoveredRating || formData.rating)
											? 'fill-yellow-400 text-yellow-400'
											: 'text-gray-300'}"
									/>
								</button>
							{/each}
							{#if formData.rating > 0}
								<span class="ml-2 text-sm text-gray-600">
									{formData.rating} star{formData.rating !== 1 ? 's' : ''}
								</span>
							{/if}
						</div>
						{#if errors.rating}
							<Alert variant="destructive">
								<AlertDescription>{errors.rating}</AlertDescription>
							</Alert>
						{/if}
					</div>

					<!-- Title Section -->
					<div class="space-y-3">
						<Label for="title" class="text-lg font-semibold">Review Title *</Label>
						<Input
							id="title"
							bind:value={formData.title}
							placeholder="Summarize your experience in one line"
							maxlength={30}
							class={errors.title ? 'border-red-500' : ''}
						/>
						<div class="flex justify-between text-sm">
							<span class={errors.title ? 'text-red-500' : 'text-gray-500'}>
								{errors.title || '10-30 characters'}
							</span>
							<span class="text-gray-400">{formData.title.length}/30</span>
						</div>
					</div>

					<!-- Content Section -->
					<div class="space-y-3">
						<Label for="content" class="text-lg font-semibold">Tell us about your visit *</Label>
						<Textarea
							id="content"
							bind:value={formData.content}
							placeholder="Share details about what made this place great (or not so great) for you and your dog..."
							class="resize-none {errors.content ? 'border-red-500' : ''}"
							rows={6}
						/>
						<div class="flex justify-between text-sm">
							<span class={errors.content ? 'text-red-500' : 'text-gray-500'}>
								{errors.content || 'Share your experience in detail'}
							</span>
							<span class="text-gray-400">{formData.content.length}/1000</span>
						</div>
					</div>

					<!-- Visit Details Grid -->
					<div class="grid gap-6 md:grid-cols-2">
						<!-- Visit Date -->
						<div class="space-y-3">
							<Label for="visitDate" class="text-lg font-semibold">When did you visit? *</Label>
							<Popover.Root>
								<Popover.Trigger class="w-full">
									{#snippet child({ props })}
										<Button
											variant="outline"
											class={cn(
												'justify-start text-left font-normal',
												!visitDate && 'text-muted-foreground'
											)}
											{...props}
										>
											<CalendarIcon class="text-muted-foreground mr-2 size-4" />
											<span class="text-muted-foreground"
												>{visitDate
													? df.format(visitDate.toDate(getLocalTimeZone()))
													: 'Select a date'}</span
											>
										</Button>
									{/snippet}
								</Popover.Trigger>
								<Popover.Content class="w-auto p-0">
									<Calendar
										type="single"
										value={visitDate as DateValue}
										minValue={new CalendarDate(1900, 1, 1)}
										maxValue={today(getLocalTimeZone())}
										calendarLabel="Date of birth"
										onValueChange={(v) => {
											if (v) {
												formData.visitDate = v.toString();
											} else {
												formData.visitDate = '';
											}
										}}
									/>
								</Popover.Content>
							</Popover.Root>
							{#if errors.visitDate}
								<Alert variant="destructive">
									<AlertDescription>{errors.visitDate}</AlertDescription>
								</Alert>
							{/if}
						</div>

						<!-- Number of Dogs -->
						<div class="space-y-3">
							<Label for="numDogs" class="text-lg font-semibold">Number of Dogs *</Label>
							<div class="relative">
								<Dog class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
								<Input
									id="numDogs"
									type="number"
									min="1"
									max="10"
									bind:value={formData.numDogs}
									onkeydown={(e) => {
										if (['e', 'E', '+', '-', '.'].includes(e.key)) {
											e.preventDefault();
										}
									}}
									class="pl-10 {errors.numDogs ? 'border-red-500' : ''}"
								/>
							</div>
							{#if errors.numDogs}
								<Alert variant="destructive">
									<AlertDescription>{errors.numDogs}</AlertDescription>
								</Alert>
							{/if}
						</div>
					</div>

					<!-- Time of Visit -->
					<div class="space-y-3">
						<Label class="text-lg font-semibold">Time of Visit *</Label>
						<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
							{#each timeOptions as option}
								<button
									type="button"
									onclick={() => handleTimeOfVisitToggle(option.value)}
									class="cursor-pointer rounded-lg border-2 p-4 text-center transition-all {formData.timeOfVisit ===
									option.value
										? 'text-primary border-[#709eea] bg-[#f1f5fd]'
										: 'border-gray-200 hover:border-gray-300'}"
								>
									<div class="mb-1 text-2xl">{option.icon}</div>
									<div class="font-medium">{option.label}</div>
									<div class="text-sm text-gray-500">{option.time}</div>
								</button>
							{/each}
						</div>
						{#if errors.timeOfVisit}
							<Alert variant="destructive">
								<AlertDescription>{errors.timeOfVisit}</AlertDescription>
							</Alert>
						{/if}
					</div>

					<!-- Dog Breeds -->
					<div class="space-y-3">
						<Label class="text-lg font-semibold">Dog Breed(s) *</Label>
						<Select.Root type="multiple" bind:value={formData.dogBreeds}>
							<Select.Trigger
								class="h-auto min-h-[80px] w-full p-1 [&>span]:!flex [&>span]:!h-auto [&>span]:!flex-wrap"
							>
								<div class="flex h-full flex-wrap items-center gap-x-1">
									{#if formData.dogBreeds && formData.dogBreeds.length > 0}
										{#each formData.dogBreeds as breedName}
											<Badge variant="secondary" class="text-xs">
												{breedName}
												<button
													type="button"
													onclick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														formData.dogBreeds = formData.dogBreeds.filter(
															(name) => name !== breedName
														);
													}}
													class="hover:bg-muted z-50 ml-1 rounded-full"
												>
													<X class="h-3 w-3" />
												</button>
											</Badge>
										{/each}
									{:else}
										<span class="text-muted-foreground flex-1 text-sm">Select dog breeds</span>
									{/if}
								</div>
							</Select.Trigger>
							<Select.Content class="h-[300px]">
								<Input bind:value={search} placeholder="Search for a breed" class="sticky w-full" />
								<Select.Group>
									<Select.Label>
										Dog Breeds ({filteredBreeds?.length} available) -
										{formData.dogBreeds.length}/6 selected
									</Select.Label>
									{#if filteredBreeds}
										{#each filteredBreeds as breed}
											<Select.Item
												value={breed.name}
												label={breed.name}
												disabled={formData.dogBreeds.length >= 6 &&
													!formData.dogBreeds.includes(breed.name)}
											>
												{breed.name}
											</Select.Item>
										{/each}
									{:else}
										<div class="p-4 text-sm text-gray-500">No breeds found</div>
									{/if}
								</Select.Group>
							</Select.Content>
						</Select.Root>
						<p class="text-sm text-gray-500">
							Selected: {formData.dogBreeds.length} breed{formData.dogBreeds.length !== 1
								? 's'
								: ''}
						</p>
						{#if errors.dogBreeds}
							<Alert variant="destructive">
								<AlertDescription>{errors.dogBreeds}</AlertDescription>
							</Alert>
						{/if}
					</div>

					<!-- First Visit Toggle -->
					<div class="flex items-center space-x-3">
						<Checkbox id="firstVisit" bind:checked={formData.isFirstVisit} />
						<Label for="firstVisit" class="text-lg font-semibold">
							This was my first visit to this place
						</Label>
					</div>

					<!-- Image Upload -->
					<div class="space-y-3">
						<Label class="text-lg font-semibold">Add Photos (Optional)</Label>
						<div
							class="bg-muted mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 dark:border-white/25"
							ondragover={handleDragOver}
							ondrop={handleDrop}
							role="button"
							tabindex="0"
							aria-label="Drag and drop files here, or click to select files"
						>
							<div class="text-center">
								<ImagePlus class="text-muted-foreground mx-auto h-12 w-12" />
								<div class="mt-4 flex text-sm/6 text-gray-600 dark:text-gray-400">
									<label
										for="file-upload"
										class="text-primary focus-within:outline-primary hover:text-primary/90 dark:text-primary relative cursor-pointer font-semibold"
									>
										<span>Upload a file</span>
										<Input
											id="file-upload"
											type="file"
											accept="image/*"
											name="file-upload"
											class="sr-only"
											onchange={handleImageSelect}
											multiple
										/>
									</label>
									<p class="pl-1">or drag and drop</p>
								</div>
								<p class="text-muted-foreground text-xs/5">PNG, JPG, GIF up to 5MB</p>
								<p class="text-muted-foreground text-xs/5">(Max 6 Images)</p>
							</div>
						</div>

						{#if formData.images.length > 0}
							<div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
								{#each formData.images as image, index}
									<div class="relative h-full w-full">
										<div class="absolute inset-0">
											<button
												onclick={() => removeImage(image.id)}
												class="animate-in absolute right-2 top-2 z-50 cursor-pointer rounded-full bg-black px-1 py-1 text-white opacity-80 hover:opacity-60"
											>
												<X class="h-3 w-3" />
											</button>
										</div>
										<img
											src={image.url}
											alt="Upload {index + 1}"
											class="max-h-[100px] w-full rounded-lg object-cover object-center"
										/>
									</div>
								{/each}
							</div>
						{/if}
						{#if errors.images}
							<Alert variant="destructive">
								<AlertDescription>{errors.images}</AlertDescription>
							</Alert>
						{/if}
					</div>

					<div class="flex space-x-2">
						<Checkbox id="terms" bind:checked={termsChecked} />
						<Label for="terms" class="text-sm text-gray-600">
							I confirm that this review is based on my own experience and is my genuine opinion of
							this place. I understand that Woofs Welcome has a zero-tolerance policy for fake
							reviews and that my review may be removed if it is found to violate these guidelines.
						</Label>
					</div>

					<!-- Submit Button -->
					<div class="pt-6">
						<Button
							onclick={handleSubmit}
							class="w-full py-4 text-lg"
							size="lg"
							disabled={!termsChecked}
						>
							{#if $createReview.isPending}
								<span>Submitting</span>
								<Loader2 class="ml-2 h-5 w-5 animate-spin" />
							{:else}
								<span>Submit Review</span>
								<Dog class="ml-2 h-5 w-5" />
							{/if}
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
{/if}

<style>
	:global(.star-button:hover) {
		transform: scale(1.1);
	}
</style>
