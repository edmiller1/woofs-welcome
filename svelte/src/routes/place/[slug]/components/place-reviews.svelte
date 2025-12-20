<script lang="ts">
	import StarRating from '$lib/components/star-rating.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { formatDate, getTimeOfVisitEmoji, getUserInitials } from '$lib/helpers';
	import type { BAUser } from '$lib/types/models';
	import { Flag, LoaderCircle, SquarePen, Star, ThumbsUp } from '@lucide/svelte';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { cn } from '$lib/utils';
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { api } from '$lib/api';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { toast } from 'svelte-sonner';
	import ReviewImageDialog from './review-image-dialog.svelte';
	import ReportReviewDialog from './report-review-dialog.svelte';
	import { goto } from '$app/navigation';
	import ErrorBoundary from '$lib/components/error-boundary.svelte';
	import DeleteReviewModal from '$lib/components/delete-review-modal.svelte';

	interface Props {
		placeName: string;
		placeSlug: string;
		openAuthModal: () => void;
		user: BAUser | null;
		currentPage: number;
		onPageChange: (page: number) => void;
	}

	const { openAuthModal, user, placeName, placeSlug, currentPage, onPageChange }: Props = $props();

	const queryClient = useQueryClient();

	let open = $state(false);
	let isDeleteOpen = $state<boolean>(false);

	const reviews = createQuery({
		queryKey: ['reviews', placeSlug, currentPage],
		queryFn: () => api.review.getPlaceReviews(placeSlug, currentPage - 1),
		enabled: !!placeSlug
	});

	const reviewStats = createQuery({
		queryKey: ['review-stats', placeSlug],
		queryFn: () => api.review.getReviewStats(placeSlug),
		enabled: !!placeSlug
	});

	const likeReview = createMutation({
		mutationFn: () => api.review.likeReview(placeSlug),
		onSuccess: () => {
			toast.success('Review liked!');
			queryClient.invalidateQueries({ queryKey: ['reviews', placeSlug] });
		}
	});

	const reportReview = createMutation({
		mutationFn: (reportData: { reason: string; details: string }) =>
			api.review.reportReview(placeSlug, reportData),
		onSuccess: () => {
			toast.success('Review reported. Thank you for your feedback.');
			open = false;
			queryClient.invalidateQueries({ queryKey: ['reviews', placeSlug] });
		}
	});

	const handleLikeReview = () => {
		if (!user) {
			openAuthModal();
			return;
		}
		$likeReview.mutate();
	};

	const handleReportReview = (reportData: { reason: string; details: string }) => {
		$reportReview.mutate(reportData);
	};

	const openReportDialog = (hasReported: boolean) => {
		if (!user) {
			openAuthModal();
			return;
		} else if (hasReported) {
			goto('/profile/reviews');
			return;
		}
		open = true;
	};

	const nextPage = () => onPageChange(currentPage + 1);
	const prevPage = () => onPageChange(currentPage - 1);

	// Handle open delete modal
	const handleDeleteModalOpen = () => {
		if (isDeleteOpen) {
			isDeleteOpen = false;
		} else {
			isDeleteOpen = true;
		}
	};
</script>

<ErrorBoundary error={$reviews.error}>
	{#if $reviewStats.isLoading || $reviews.isLoading}
		<div class="flex min-h-screen items-center justify-center">
			<LoaderCircle class="text-primary size-10 animate-spin" />
		</div>
	{/if}

	{#if $reviewStats.isSuccess && $reviews.isSuccess}
		{#if $reviews.data.reviews.length > 0}
			<div>
				<div class="mb-6 flex items-center justify-between">
					<div>
						<h3 class="text-2xl font-semibold">Reviews ({$reviewStats.data.totalReviews})</h3>
						<div class="mt-2 flex items-center gap-2">
							<div class="flex items-center gap-2">
								<StarRating rating={$reviewStats.data.averageRating} />
								<span class="text-muted-foreground text-sm"
									>{$reviewStats.data.averageRating} out of 5</span
								>
							</div>
							&middot;
							<span class="text-muted-foreground text-sm"
								>Based on {$reviewStats.data.totalReviews} dog owner reviews</span
							>
						</div>
					</div>
					<a
						target="_blank"
						href="/review/{placeSlug}"
						class={cn(buttonVariants({ variant: 'outline' }))}
						><Star class="size-4" /> Write a Review</a
					>
				</div>

				<div class="bg-muted mb-8 rounded-lg p-6">
					<div class="space-y-3">
						{#each $reviewStats.data.reviewBreakdown as { rating, count, percentage }}
							<div class="flex items-center gap-3">
								<div class="flex w-16 items-center gap-1">
									<span class="text-sm">{rating}</span>
									<Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
								</div>
								<div class="h-2 flex-1 rounded-full bg-gray-200">
									<div
										class="h-2 rounded-full bg-yellow-400 transition-all duration-300"
										style={`width: ${percentage}%`}
									></div>
								</div>
								<div class="text-muted-foreground w-12 text-right text-sm">
									{count > 0 ? `${percentage}%` : '0%'}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="space-y-6">
					{#each $reviews.data.reviews as review}
						{@const reviewId = review.id}
						<div class="rounded-lg border p-6 shadow-sm">
							<div class="mb-4 flex items-start gap-4">
								<Avatar.Root class="size-12">
									<Avatar.Image
										src={review.user.image}
										alt="review user avatar"
										referrerpolicy="no-referrer"
									/>
									<Avatar.Fallback>{getUserInitials(review.user.name)}</Avatar.Fallback>
								</Avatar.Root>
								<div class="flex-1">
									<div class="flex items-center justify-between">
										<div>
											<h4 class="font-semibold">{review.user.name}</h4>
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
										{#if review.userId !== user?.id}
											<div class="flex items-center gap-2">
												<Tooltip.Provider>
													<Tooltip.Root>
														<Tooltip.Trigger>
															<Button
																variant="outline"
																class="rounded-full p-1"
																onclick={handleLikeReview}
																disabled={$likeReview.isPending}
															>
																<ThumbsUp
																	class={cn(
																		'h-4 w-4',
																		review.hasLiked
																			? 'fill-primary text-primary'
																			: 'text-muted-foreground'
																	)}
																/>
																{#if review.likesCount > 0}
																	<span class="text-xs">{review.likesCount}</span>
																{/if}
															</Button>
														</Tooltip.Trigger>
														<Tooltip.Content>
															<p>
																{review.hasLiked ? 'Unlike this review' : 'This review is helpful'}
															</p>
														</Tooltip.Content>
													</Tooltip.Root>
												</Tooltip.Provider>
												<Tooltip.Provider>
													<Tooltip.Root>
														<Tooltip.Trigger>
															<Button
																variant="outline"
																class="rounded-full p-1"
																onclick={() => openReportDialog(review.hasReported!)}
															>
																<Flag
																	class={cn(
																		'size-4',
																		review.hasReported
																			? 'fill-primary text-primary'
																			: 'text-muted-foreground'
																	)}
																/>
															</Button>
														</Tooltip.Trigger>
														<Tooltip.Content>
															<p>
																{review.hasReported ? 'Update your report' : 'Report this review'}
															</p>
														</Tooltip.Content>
													</Tooltip.Root>
												</Tooltip.Provider>
												<ReportReviewDialog
													{handleReportReview}
													hasReported={review.hasReported ?? false}
													{openReportDialog}
													reportLoading={$reportReview.isPending}
													{open}
												/>
											</div>
										{:else}
											<div class="flex items-center gap-2">
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
												<DeleteReviewModal
													{reviewId}
													{placeSlug}
													openModal={handleDeleteModalOpen}
													open={isDeleteOpen}
												/>
											</div>
										{/if}
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
						</div>
					{/each}
				</div>

				{#if $reviews.data.reviews.length > 10}
					<div class="py-8">
						<Pagination.Root count={$reviewStats.data.totalReviews} perPage={10}>
							{#snippet children({ pages, currentPage })}
								<Pagination.Content>
									<Pagination.Item>
										<Pagination.PrevButton onclick={prevPage} />
									</Pagination.Item>
									<Pagination.Item>
										{#each pages as page (page.key)}
											{#if page.type === 'ellipsis'}
												<Pagination.Item>
													<Pagination.Ellipsis />
												</Pagination.Item>
											{:else}
												<Pagination.Item>
													<Pagination.Link {page} isActive={currentPage === page.value}>
														{page.value}
													</Pagination.Link>
												</Pagination.Item>
											{/if}
										{/each}

										<Pagination.Item>
											<Pagination.NextButton onclick={nextPage} />
										</Pagination.Item>
									</Pagination.Item>
								</Pagination.Content>
							{/snippet}
						</Pagination.Root>
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex items-center justify-between">
				<div>
					<h3 class="mb-4 text-2xl font-semibold">Reviews (0)</h3>
					<p class="text-muted-foreground mb-6">Be the first to review {placeName}!</p>
				</div>
				<a
					target="_blank"
					href="/review/{placeSlug}"
					class={cn(buttonVariants({ variant: 'outline' }))}
					><Star class="size-4" /> Write a Review</a
				>
			</div>
		{/if}
	{/if}
</ErrorBoundary>
