<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { BAUser, Breed } from '$lib/types/models.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		AlertCircleIcon,
		CalendarIcon,
		ChevronsUpDown,
		Dog,
		ImagePlus,
		Loader2,
		Star,
		X
	} from '@lucide/svelte';
	import {
		CalendarDate,
		DateFormatter,
		getLocalTimeZone,
		parseDate,
		today,
		type DateValue
	} from '@internationalized/date';
	import { createQuery } from '@tanstack/svelte-query';
	import { api } from '$lib/api/index.js';
	import { reviewFormSchema } from '$lib/schemas';
	import Label from '$lib/components/ui/label/label.svelte';
	import { cn } from '$lib/utils';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Textarea } from '$lib/components/ui/textarea';

	interface Props {
		placeId: string;
		placeName: string;
		placeTypes: string[];
		openAuthModal: () => void;
		user: BAUser | null;
	}

	const { placeId, placeName, placeTypes, openAuthModal, user }: Props = $props();

	const breeds = createQuery({
		queryKey: ['breeds'],
		queryFn: () => api.review.getBreeds()
	});

	let showReviewModal = $state<boolean>(false);
	let overallRatingHover = $state<number>(0);
	let rating = $state<number>(1);
	let staffRating = $state<number>(1);
	let staffRatingHover = $state<number>(0);
	let search = $state<string>('');
	let filteredBreeds = $state<Breed[] | undefined>([]);
	let isHospitality = $derived(
		placeTypes.some((type) =>
			['Motel', 'Hotel', 'AirBnb', 'Café', 'Bar', 'Restaurant'].includes(type)
		)
	);
	const timeOfVisitOptions = [
		{ value: 'morning', label: 'Morning' },
		{ value: 'afternoon', label: 'Afternoon' },
		{ value: 'evening', label: 'Evening' }
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

	const form = superForm(defaults(zod(reviewFormSchema)), {
		validators: zod(reviewFormSchema),
		SPA: true
	});

	const { form: formData, enhance } = form;

	const setRating = (newRating: number, type: 'overall' | 'staff' = 'overall') => {
		if (type === 'overall') {
			rating = newRating;
		} else {
			staffRating = newRating;
		}
	};

	const handleStarHover = (rating: number, type: 'overall' | 'staff') => {
		if (type === 'overall') {
			overallRatingHover = rating;
		} else {
			staffRatingHover = rating;
		}
	};

	const handleStarLeave = (type: 'overall' | 'staff') => {
		if (type === 'overall') {
			overallRatingHover = 0;
		} else {
			staffRatingHover = 0;
		}
	};

	const handleReviewSuccess = (e: SubmitEvent) => {
		e.stopPropagation();
		e.preventDefault();
	};

	const df = new DateFormatter('en-AU', {
		dateStyle: 'long'
	});

	let visitDate = $derived($formData.visitDate ? parseDate($formData.visitDate) : undefined);
	const timeOfVisitContent = $derived(
		timeOfVisitOptions.find((option) => option.value === $formData.timeOfVisit)?.label ??
			'Select a time'
	);
</script>

{#if $breeds.isSuccess && $breeds.data?.breeds}
	<Dialog.Root bind:open={showReviewModal}>
		<Dialog.Trigger>
			<Button
				variant="outline"
				onclick={user ? () => console.log('open review form') : openAuthModal}
			>
				<Star class="size-4" /> Write a Review
			</Button>
		</Dialog.Trigger>
		<Dialog.Content
			showCloseButton={false}
			class="min-w-4xl z-[99] max-h-[90%] overflow-y-auto"
			onEscapeKeydown={(e) => {
				e.preventDefault();
				e.stopPropagation();
			}}
		>
			<Dialog.Header class="font-semibold">Write a Review for {placeName}</Dialog.Header>
			<Dialog.Description>Share your experience with other dog owners</Dialog.Description>
			{#if $breeds.isLoading}
				<div class="flex min-h-screen items-center justify-center">
					<Loader2 class="text-primary size-10 animate-spin" />
				</div>
			{:else}
				<form method="POST" id="review-form" use:enhance class="space-y-6">
					<!-- Overall rating -->
					<div class="space-y-2">
						<Label class="text-base font-semibold">Overall Rating</Label>
						<div class="flex items-center">
							{#each Array(5) as _, i}
								{@const starValue = i + 1}
								{@const isActive = starValue <= (overallRatingHover || rating)}
								<button
									type="button"
									class="cursor-pointer p-0.5 transition-colors hover:scale-110"
									onclick={() => setRating(starValue, 'overall')}
									onmouseenter={() => handleStarHover(starValue, 'overall')}
									onmouseleave={() => handleStarLeave('overall')}
								>
									<Star
										class={cn(
											'size-5 transition-colors',
											isActive ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
										)}
									/>
								</button>
							{/each}
						</div>
					</div>

					<!-- Visit date -->
					<Form.Field {form} name="visitDate" class="space-y-2">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>When did you visit?</Form.Label>
								<Popover.Root>
									<Popover.Trigger {...props}>
										{#snippet child({ props })}
											<Button
												variant="outline"
												class={cn(
													'w-[400px] justify-start text-left font-normal',
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
													$formData.visitDate = v.toString();
												} else {
													$formData.visitDate = '';
												}
											}}
										/>
									</Popover.Content>
								</Popover.Root>
								<Form.FieldErrors />
								<input hidden value={$formData.visitDate} name={props.name} />
							{/snippet}
						</Form.Control>
					</Form.Field>

					<!-- Num dogs -->
					<Form.Field {form} name="numDogs" class="space-y-2">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Number of dogs</Form.Label>
								<Input
									type="number"
									min="1"
									max="10"
									{...props}
									onkeydown={(e) => {
										if (['e', 'E', '+', '-', '.'].includes(e.key)) {
											e.preventDefault();
										}
									}}
								/>
								<Form.FieldErrors />
								<input hidden value={$formData.numDogs} name={props.name} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<!-- Dog Breeds -->
					<Form.Field {form} name="dogBreeds" class="space-y-2">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Dog Breeds</Form.Label>
								<Select.Root type="multiple" bind:value={$formData.dogBreeds} {...props}>
									<Select.Trigger
										class="h-auto min-h-[80px] w-full p-1 [&>span]:!flex [&>span]:!h-auto [&>span]:!flex-wrap"
									>
										<div class="flex h-full flex-wrap items-center gap-x-1">
											{#if $formData.dogBreeds && $formData.dogBreeds.length > 0}
												{#each $formData.dogBreeds as breedName}
													<Badge variant="secondary" class="text-xs">
														{breedName}
														<button
															type="button"
															onclick={(e) => {
																e.preventDefault();
																e.stopPropagation();
																$formData.dogBreeds = $formData.dogBreeds.filter(
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
										<Input bind:value={search} placeholder="Search for a breed" class="w-full" />
										<Select.Group>
											<Select.Label>
												Dog Breeds ({filteredBreeds?.length} available) -
												{$formData.dogBreeds.length}/6 selected
											</Select.Label>
											{#if filteredBreeds}
												{#each filteredBreeds as breed}
													<Select.Item
														value={breed.name}
														label={breed.name}
														disabled={$formData.dogBreeds.length >= 6 &&
															!$formData.dogBreeds.includes(breed.name)}
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
								{#if $formData.dogBreeds.length >= 6}
									<Alert.Root variant="destructive">
										<AlertCircleIcon />
										<Alert.Title>Maximum 6 dog breeds allowed</Alert.Title>
									</Alert.Root>
								{/if}
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<!-- Time of Visit -->
					<Form.Field {form} name="dogBreeds" class="space-y-2">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Time of Visit</Form.Label>
								<Select.Root type="single" bind:value={$formData.timeOfVisit} {...props}>
									<Select.Trigger>{timeOfVisitContent}</Select.Trigger>
									<Select.Content>
										<Select.Group>
											{#each timeOfVisitOptions as option}
												<Select.Item value={option.value}>{option.label}</Select.Item>
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<!-- Title -->
					<Form.Field {form} name="title" class="space-y-2">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Give your review a title</Form.Label>
								<Input type="text" {...props} />
								<Form.FieldErrors />
								<input hidden value={$formData.title} name={props.name} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<!-- Content -->
					<Form.Field {form} name="content" class="space-y-2">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Write your review</Form.Label>
								<Textarea {...props} />
								<Form.FieldErrors />
								<textarea hidden value={$formData.content} name={props.name}></textarea>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<!-- Images -->
					<div class="col-span-full space-y-2">
						<Label>Add some photos (optional)</Label>
						<div
							class="bg-muted mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 dark:border-white/25"
						>
							<div class="text-center">
								<ImagePlus class="text-muted-foreground mx-auto h-12 w-12" />
								<div class="mt-4 flex text-sm/6 text-gray-600 dark:text-gray-400">
									<label
										for="file-upload"
										class="text-primary focus-within:outline-primary hover:text-primary/90 dark:text-primary relative cursor-pointer rounded-md font-semibold focus-within:outline-2 focus-within:outline-offset-2 dark:bg-transparent"
									>
										<span>Upload a file</span>
										<Input
											id="file-upload"
											type="file"
											name="file-upload"
											class="sr-only"
											multiple
										/>
									</label>
									<p class="pl-1">or drag and drop</p>
								</div>
								<p class="text-muted-foreground text-xs/5">PNG, JPG, GIF up to 10MB</p>
								<p class="text-muted-foreground text-xs/5">(Max 6 Images)</p>
							</div>
						</div>
					</div>

					<Dialog.Footer class="flex items-center gap-2">
						<Button type="submit" disabled>
							{#if true}
								<Loader2 class="size-3 animate-spin" stroke-width={3} />
								Submitting...
							{:else}
								Submit
							{/if}
						</Button>
						<Button variant="outline">Cancel</Button>
					</Dialog.Footer>
				</form>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
{/if}
