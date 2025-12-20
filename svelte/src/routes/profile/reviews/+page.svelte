<script lang="ts">
	import { api } from '$lib/api';
	import { Separator } from '$lib/components/ui/separator';
	import type { BAUser, ProfileReview, Review } from '$lib/types/models';
	import { LoaderCircle } from '@lucide/svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { formatDate, getTimeOfVisitEmoji, getUserInitials } from '$lib/helpers';
	import StarRating from '$lib/components/star-rating.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import ReviewImageDialog from '../../place/[slug]/components/review-image-dialog.svelte';
	import DeleteReviewModal from '$lib/components/delete-review-modal.svelte';
	import EditReviewDialog from '$lib/components/edit-review-dialog.svelte';

	interface Props {
		data: {
			user: BAUser;
		};
	}

	const { data }: Props = $props();

	const { user } = data;

	// State
	let isDeleteOpen = $state<boolean>(false);
	const limit = 12;
	let currentPage = $state<number>(1);
	let editingReview = $state<Review | ProfileReview | null>(null);
	let isEditOpen = $state(false);

	const offset = $derived((currentPage - 1) * limit);

	const reviews = $derived(
		createQuery({
			queryKey: ['profile-reviews', offset],
			queryFn: () => api.auth.getProfileReviews(limit, offset)
		})
	);

	const breeds = createQuery({
		queryKey: ['breeds'],
		queryFn: () => api.review.getBreeds()
	});

	// Handle page change
	const handlePageChange = (newPage: number) => {
		currentPage = newPage;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Handle open delete modal
	const handleDeleteModalOpen = () => {
		if (isDeleteOpen) {
			isDeleteOpen = false;
		} else {
			isDeleteOpen = true;
		}
	};

	const handleEditModalOpen = (review?: Review | ProfileReview) => {
		if (review) {
			editingReview = review;
			isEditOpen = true;
		} else {
			isEditOpen = false;
			editingReview = null;
		}
	};

	// Calculate total pages
	const totalPages = $derived($reviews.data ? Math.ceil($reviews.data.total / limit) : 0);
</script>

<div class="max-w-full">
	<div class="mb-6">
		<h1 class="mb-2 text-2xl font-bold">Reviews</h1>
		{#if $reviews.isSuccess}
			<p class="text-sm text-gray-600">
				Showing {Math.min(offset + 1, $reviews.data.total)}-{Math.min(
					offset + limit,
					$reviews.data.total
				)} of {$reviews.data.total}
				{$reviews.data.total === 1 ? 'review' : 'reviews'}
			</p>
		{/if}
	</div>
	<Separator class="mb-6" />
	{#if $reviews.isLoading}
		<!-- Loading skeleton -->
		<div class="flex items-center justify-center py-12">
			<LoaderCircle class="text-primary size-8 animate-spin" />
		</div>
	{:else if $reviews.isError}
		<!-- Error state -->
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
			Failed to load reviews. Please try again.
		</div>
	{:else if $reviews.data && $reviews.data.data.length === 0}
		<!-- Empty state -->
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<p class="mb-2 text-lg font-medium text-gray-900">No reviews yet</p>
			<p class="text-sm text-gray-600">Start exploring and write your first review</p>
			<a href="/explore" class="mt-3">
				<Button>Explore Now</Button>
			</a>
		</div>
	{:else if $reviews.data && $reviews.data.data.length > 0}
		<!-- List of reviews -->
		<div class="space-y-6">
			{#each $reviews.data.data as review}
				{@const reviewId = review.id}
				{@const placeSlug = review.place.slug}
				<div class="rounded-lg border p-6 shadow-sm">
					<div class="itesm-start mb-4 flex gap-4">
						<Avatar.Root class="size-12">
							<Avatar.Image
								src={user.image}
								alt="review user avatar"
								referrerpolicy="no-referrer"
							/>
							<Avatar.Fallback>{getUserInitials(user.name)}</Avatar.Fallback>
						</Avatar.Root>
						<div class="flex-1">
							<div class="flex items-center justify-between">
								<div>
									<h4 class="font-semibold">{user.name}</h4>
									<div class="mt-1 flex items-center gap-2">
										<StarRating rating={review.rating} />
										<span class="text-muted-foreground text-sm">
											{formatDate(review.visitDate)} &middot; {review.numDogs}
											{review.numDogs === 1 ? 'dog' : 'dogs'}
										</span>
										<span class="text-sm">
											{getTimeOfVisitEmoji(review.timeOfVisit)}
											{review.timeOfVisit}
										</span>
									</div>
								</div>
								<div class="flex items-center gap-2">
									{#if $breeds.isSuccess}
										<EditReviewDialog
											{review}
											placeName={review.place.name}
											placeSlug={review.place.slug}
											open={isEditOpen}
											openModal={handleEditModalOpen}
											breeds={$breeds.data.breeds}
										/>
									{/if}
									<DeleteReviewModal
										{reviewId}
										{placeSlug}
										openModal={handleDeleteModalOpen}
										open={isDeleteOpen}
									/>
								</div>
							</div>
							<div class="mt-2 flex gap-1">
								{#each review.dogBreeds as breed}
									<Badge variant="secondary" class="rounded-full px-2 py-1 text-xs">
										{breed}
									</Badge>
								{/each}
							</div>
						</div>
					</div>
					<p class="mb-1 font-semibold leading-relaxed">{review.title}</p>
					<p class="mb-4 leading-relaxed">{review.content}</p>
					<div class="my-2 flex items-center gap-2 p-2">
						{#each review.images as image}
							<ReviewImageDialog {image} images={review.images} />
						{/each}
					</div>
					<div class="text-muted-foreground flex flex-col p-2 text-sm">
						<p>{review.place.name}, {review.place.city.name}</p>
						<p>{review.place.city.region.name}</p>
					</div>
				</div>
			{/each}
		</div>

		<!-- Pagination Controls -->
		{#if $reviews.data && totalPages > 1}
			<Pagination.Root
				count={$reviews.data.total}
				perPage={limit}
				page={currentPage}
				onPageChange={handlePageChange}
				class="mt-8"
			>
				{#snippet children({ pages, currentPage: activePage })}
					<Pagination.Content>
						<Pagination.Item>
							<Pagination.PrevButton />
						</Pagination.Item>
						{#each pages as page (page.key)}
							{#if page.type === 'ellipsis'}
								<Pagination.Item>
									<Pagination.Ellipsis />
								</Pagination.Item>
							{:else}
								<Pagination.Item>
									<Pagination.Link {page} isActive={activePage === page.value}>
										{page.value}
									</Pagination.Link>
								</Pagination.Item>
							{/if}
						{/each}
						<Pagination.Item>
							<Pagination.NextButton />
						</Pagination.Item>
					</Pagination.Content>
				{/snippet}
			</Pagination.Root>
		{/if}
	{/if}
</div>
