<script lang="ts">
	import { api } from '$lib/api';
	import { CalendarIcon, Dog, ImagePlus, LoaderCircle, SquarePen, Star, X } from '@lucide/svelte';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select/index.js';
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
	import type { AxiosError } from 'axios';
	import ValidationError from '$lib/components/validation-error.svelte';
	import { useValidation } from '$lib/hooks/use-validation.svelte.js';
	import type { DogBreed, Review } from '$lib/types/review';
	import type { GetProfileReviewsResponse } from '$lib/types/user';
	import type { GetPlaceReviewsResponse } from '$lib/types/place';
	import { reviewFormSchema } from '$lib/schemas/review';
	import type { ErrorResponse } from '$lib/types/types';

	interface Props {
		review: GetPlaceReviewsResponse['reviews'][0] | GetProfileReviewsResponse['data'][0];
		placeName: string;
		placeSlug: string;
		open: boolean;
		openModal: () => void;
		breeds: DogBreed[];
	}

	type TimeOfVisit = 'morning' | 'afternoon' | 'evening';

	let { review, open, openModal, breeds, placeName, placeSlug }: Props = $props();

	const queryClient = useQueryClient();

	// Initialize form with existing review data
	let formData = $state({
		placeId: review.placeId,
		placeSlug: placeSlug,
		rating: review.rating,
		title: review.title,
		content: review.content,
		visitDate: review.visitDate.split('T')[0],
		numDogs: review.numDogs,
		dogBreeds: [...review.dogBreeds],
		timeOfVisit: review.timeOfVisit,
		isFirstVisit: review.isFirstVisit,
		existingImages: review.images.map((img) => ({
			id: img.id,
			publicId: img.publicId,
			url: img.url
		})),
		newImages: [] as { id: string; url: string; base64Value: string }[],
		imagesToDelete: [] as string[]
	});

	const validation = useValidation(reviewFormSchema);

	const updateReview = createMutation({
		mutationFn: (data: {
			placeId: string;
			placeSlug: string;
			rating: number;
			title: string;
			content: string;
			visitDate: string;
			numDogs: number;
			dogBreeds: string[];
			timeOfVisit: TimeOfVisit;
			isFirstVisit: boolean;
			existingImageCount: number;
			newImages: string[];
			imagesToDelete: string[];
		}) => api.review.editReview(review.id, data),
		onSuccess: () => {
			toast.success('Review updated successfully!');

			queryClient.invalidateQueries({ queryKey: ['profile-reviews'] });
			queryClient.invalidateQueries({ queryKey: ['place', placeSlug] });

			open = false;

			if (formData.newImages.length > 0) {
				setTimeout(() => {
					toast.info('New images should be ready now. Refresh to see them!');
					queryClient.invalidateQueries({ queryKey: ['profile-reviews'] });
					queryClient.invalidateQueries({ queryKey: ['place', placeSlug] });
				}, 15000);
			}
		},
		onError: (error: AxiosError<ErrorResponse>) => {
			if (error.response?.data.error) {
				toast.error(error.response.data.error);
			} else {
				toast.error('Failed to update review. Please try again.');
			}
		}
	});

	// Track UI state
	let hoveredRating = $state<number>(0);
	let filteredBreeds = $state<DogBreed[]>([]);
	let search = $state<string>('');

	// Time options (same as create form)
	const timeOptions = [
		{ value: 'morning', label: 'Morning', time: '6AM - 12PM', icon: '🌅' },
		{ value: 'afternoon', label: 'Afternoon', time: '12PM - 6PM', icon: '☀️' },
		{ value: 'evening', label: 'Evening', time: '6PM - 12AM', icon: '🌆' }
	];

	// Filter breeds based on search
	$effect(() => {
		if (search) {
			filteredBreeds = breeds.filter((breed) =>
				breed.name.toLowerCase().includes(search.toLowerCase())
			);
		} else {
			filteredBreeds = breeds;
		}
	});

	// Calculate total images (existing + new - deleted)
	const totalImages = $derived(
		formData.existingImages.filter((img) => !formData.imagesToDelete.includes(img.publicId))
			.length + formData.newImages.length
	);

	// Event handlers
	function handleRatingClick(rating: number) {
		formData.rating = rating;
	}

	function handleTimeOfVisitToggle(timeOfVisit: string) {
		formData.timeOfVisit = formData.timeOfVisit === timeOfVisit ? '' : timeOfVisit;
	}

	// Remove existing image (mark for deletion)
	function removeExistingImage(publicId: string) {
		formData.imagesToDelete = [...formData.imagesToDelete, publicId];
	}

	// Undo removal of existing image
	function undoRemoveExistingImage(publicId: string) {
		formData.imagesToDelete = formData.imagesToDelete.filter((id) => id !== publicId);
	}

	// Remove new image
	function removeNewImage(id: string) {
		formData.newImages = formData.newImages.filter((img) => img.id !== id);
	}

	// Image upload handlers
	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = async (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const files = Array.from(e.dataTransfer?.files || []);
		await addNewImages(files);
	};

	const handleImageSelect = async (e: Event) => {
		const target = e.target as HTMLInputElement;
		const files = Array.from(target.files || []);
		await addNewImages(files);
	};

	async function addNewImages(files: File[]) {
		if (totalImages + files.length > 6) {
			toast.warning('Maximum of 6 images allowed');
			return;
		}

		const newImages = await Promise.all(
			files.map(async (file) => {
				const base64String = await getFileBase64(file);
				return {
					id: generateUID(),
					url: URL.createObjectURL(file),
					base64Value: base64String
				};
			})
		);

		formData.newImages = [...formData.newImages, ...newImages];
	}

	function handleSubmit() {
		// Frontend validation for total images
		const remainingExisting = formData.existingImages.length - formData.imagesToDelete.length;
		const totalImages = remainingExisting + formData.newImages.length;

		if (totalImages > 6) {
			toast.error('Total images cannot exceed 6. Please remove some existing images first.');
			return;
		}

		// Prepare data for backend (include existingImageCount)
		const updateData = {
			placeId: formData.placeId,
			placeSlug: formData.placeSlug,
			rating: formData.rating,
			title: formData.title,
			content: formData.content,
			visitDate: formData.visitDate,
			numDogs: formData.numDogs,
			dogBreeds: formData.dogBreeds,
			timeOfVisit: formData.timeOfVisit as TimeOfVisit,
			isFirstVisit: formData.isFirstVisit,
			existingImageCount: formData.existingImages.length,
			newImages: formData.newImages.map((img) => img.base64Value),
			imagesToDelete: formData.imagesToDelete
		};

		// Validate with schema (optional frontend validation)
		// You can validate here if you want, or let the backend handle it

		$updateReview.mutate(updateData);
	}

	const df = new DateFormatter('en-AU', { dateStyle: 'long' });
	let visitDate = $derived(formData.visitDate ? parseDate(formData.visitDate) : undefined);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger>
					<Button variant="outline" size="icon">
						<SquarePen class="size-4" />
					</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>Edit review</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	</Dialog.Trigger>
	<Dialog.Content
		class="max-h-[90vh] min-w-[900px] overflow-y-auto"
		onInteractOutside={(e) => {
			e.preventDefault();
		}}
		showCloseButton={false}
	>
		<Dialog.Header>
			<Dialog.Title>Edit Review</Dialog.Title>
			<Dialog.Description>
				Update your review for {placeName}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-6 py-4">
			<!-- Rating Section -->
			<div class="space-y-3">
				<Label class="text-base font-semibold">Overall Rating *</Label>
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
				<ValidationError errors={validation.errors} field="rating" />
			</div>

			<!-- Title Section -->
			<div class="space-y-3">
				<Label for="title" class="text-base font-semibold">Review Title *</Label>
				<Input
					id="title"
					bind:value={formData.title}
					placeholder="Summarize your experience in one line"
					maxlength={30}
				/>
				<div class="flex justify-between text-sm">
					<ValidationError errors={validation.errors} field="title" />
					<span class="text-gray-400">{formData.title.length}/30</span>
				</div>
			</div>

			<!-- Content Section -->
			<div class="space-y-3">
				<Label for="content" class="text-base font-semibold">Tell us about your visit *</Label>
				<Textarea
					id="content"
					bind:value={formData.content}
					placeholder="Share details about what made this place great..."
					class="resize-none"
					rows={6}
				/>
				<div class="flex justify-between text-sm">
					<ValidationError errors={validation.errors} field="content" />
					<span class="text-gray-400">{formData.content.length}/1000</span>
				</div>
			</div>

			<!-- Visit Details Grid -->
			<div class="grid gap-6 md:grid-cols-2">
				<!-- Visit Date -->
				<div class="space-y-3">
					<Label for="visitDate" class="text-base font-semibold">When did you visit? *</Label>
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
									<span class="text-muted-foreground">
										{visitDate ? df.format(visitDate.toDate(getLocalTimeZone())) : 'Select a date'}
									</span>
								</Button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0">
							<Calendar
								type="single"
								value={visitDate as DateValue}
								minValue={new CalendarDate(1900, 1, 1)}
								maxValue={today(getLocalTimeZone())}
								calendarLabel="Visit date"
								onValueChange={(v) => {
									formData.visitDate = v ? v.toString() : '';
								}}
							/>
						</Popover.Content>
					</Popover.Root>
					<ValidationError errors={validation.errors} field="visitDate" />
				</div>

				<!-- Number of Dogs -->
				<div class="space-y-3">
					<Label for="numDogs" class="text-base font-semibold">Number of Dogs *</Label>
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
							class="pl-10"
						/>
					</div>
					<ValidationError errors={validation.errors} field="numDogs" />
				</div>
			</div>

			<!-- Time of Visit -->
			<div class="space-y-3">
				<Label class="text-base font-semibold">Time of Visit *</Label>
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
				<ValidationError errors={validation.errors} field="timeOfVisit" />
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
											class="z-50 ml-1 cursor-pointer rounded-full"
										>
											<X class="h-3 w-3 text-white" />
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
					Selected: {formData.dogBreeds.length} breed{formData.dogBreeds.length !== 1 ? 's' : ''}
				</p>
				<ValidationError errors={validation.errors} field="dogBreeds" />
			</div>

			<!-- First Visit Toggle -->
			<div class="flex items-center space-x-3">
				<Checkbox id="firstVisit" bind:checked={formData.isFirstVisit} />
				<Label for="firstVisit" class="text-base font-semibold">
					This was my first visit to this place
				</Label>
			</div>

			<!-- Image Management -->
			<div class="space-y-3">
				<Label class="text-base font-semibold">Photos ({totalImages}/6)</Label>

				<!-- Existing Images -->
				{#if formData.existingImages.length > 0}
					<div class="grid grid-cols-2 md:grid-cols-4">
						{#each formData.existingImages as image (image.id)}
							{@const isMarkedForDeletion = formData.imagesToDelete.includes(image.publicId)}
							<div class="relative">
								<img
									src={image.url}
									alt="Review"
									class="size-40 rounded-lg object-cover object-center {isMarkedForDeletion
										? 'opacity-50'
										: ''}"
								/>
								{#if isMarkedForDeletion}
									<button
										type="button"
										onclick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											undoRemoveExistingImage(image.publicId);
										}}
										class="absolute inset-0 flex size-40 cursor-pointer items-center justify-center rounded-lg bg-black/50 text-xs text-white hover:underline"
									>
										Undo
									</button>
								{:else}
									<button
										type="button"
										onclick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											removeExistingImage(image.publicId);
										}}
										class="absolute right-10 top-2 cursor-pointer rounded-full bg-black p-1 text-white opacity-80 hover:opacity-60"
									>
										<X class="h-3 w-3" />
									</button>
								{/if}
							</div>
						{/each}
					</div>
				{/if}

				<!-- New Images -->
				{#if formData.newImages.length > 0}
					<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
						{#each formData.newImages as image}
							<div class="relative">
								<img src={image.url} alt="New upload" class="size-40 rounded-lg object-cover" />
								<Badge class="absolute left-2 top-2 bg-green-500 text-xs">New</Badge>
								<button
									type="button"
									onclick={() => removeNewImage(image.id)}
									class="absolute right-8 top-2 cursor-pointer rounded-full bg-black p-1 text-white opacity-80 hover:opacity-60"
								>
									<X class="h-3 w-3" />
								</button>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Upload New Images -->
				{#if totalImages < 6}
					<div
						class="bg-muted flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 dark:border-white/25"
						ondragover={handleDragOver}
						ondrop={handleDrop}
						role="button"
						tabindex="0"
					>
						<div class="text-center">
							<ImagePlus class="text-muted-foreground mx-auto h-12 w-12" />
							<div class="mt-4 flex text-sm text-gray-600 dark:text-gray-400">
								<label
									for="file-upload-edit"
									class="text-primary focus-within:outline-primary hover:text-primary/90 relative cursor-pointer font-semibold"
								>
									<span>Upload a file</span>
									<Input
										id="file-upload-edit"
										type="file"
										accept="image/*"
										class="sr-only"
										onchange={handleImageSelect}
										multiple
									/>
								</label>
								<p class="pl-1">or drag and drop</p>
							</div>
							<p class="text-muted-foreground text-xs">PNG, JPG, GIF up to 5MB</p>
						</div>
					</div>
				{/if}

				<ValidationError errors={validation.errors} field="images" />
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={openModal}>Cancel</Button>
			<Button onclick={handleSubmit} disabled={$updateReview.isPending}>
				{#if $updateReview.isPending}
					<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
					Updating...
				{:else}
					Save Changes
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
