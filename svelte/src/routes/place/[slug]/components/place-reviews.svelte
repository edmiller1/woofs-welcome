<script lang="ts">
	import StarRating from '$lib/components/star-rating.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { calculateRatingStats, formatDate, getTimeOfVisitEmoji } from '$lib/helpers';
	import type { Review } from '$lib/types/models';
	import { Flag, Star, ThumbsUp } from '@lucide/svelte';
	import * as Pagination from '$lib/components/ui/pagination/index.js';

	interface Props {
		reviews: Review[];
	}

	const { reviews }: Props = $props();

	const ratingStats = calculateRatingStats(reviews.map((review) => review.rating));
</script>

<div id="reviews" class="py-4">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h3 class="text-2xl font-semibold">Reviews ({reviews.length})</h3>
			<div class="mt-2 flex items-center gap-2">
				<div class="flex items-center gap-2">
					<StarRating rating={Math.floor(ratingStats.averageRating)} />
					<span class="text-muted-foreground text-sm">{ratingStats.averageRating} out of 5</span>
				</div>
				&middot;
				<span class="text-muted-foreground text-sm"
					>Based on {ratingStats.totalReviews} dog owner reviews</span
				>
			</div>
		</div>
		<Button variant="ghost"><Star class="size-4" /> Write a Review</Button>
	</div>

	<div class="bg-muted mb-8 rounded-lg p-6">
		<div class="space-y-3">
			{#each ratingStats.distribution as { stars, count, percentage }}
				<div class="flex items-center gap-3">
					<div class="flex w-16 items-center gap-1">
						<span class="text-sm">{stars}</span>
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
		{#each reviews as review}
			<div class="rounded-lg border p-6 shadow-sm">
				<div class="mb-4 flex items-start gap-4">
					<img
						src={review.user.image}
						alt="review user avatar"
						class="size-12 rounded-full object-cover"
					/>
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
							<div class="flex items-center gap-2">
								<Button variant="outline" class="rounded-full p-1">
									<ThumbsUp className="w-4 h-4 text-muted-foreground" />
								</Button>
								<Button variant="outline" class="rounded-full p-1">
									<Flag className="w-4 h-4 text-muted-foreground" />
								</Button>
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
				<p class="mb-4 leading-relaxed">{review.content}</p>

				{#if review.staffFriendlinessRating}
					<div class="mb-4">
						<div class="flex items-center gap-2 text-sm">
							<span class="text-muted-foreground">Staff Friendliness:</span>
							<StarRating rating={review.staffFriendlinessRating} />
							<span class="text-muted-foreground">({review.staffFriendlinessRating}/5)</span>
						</div>
					</div>
				{/if}

				{#if review.hadWaterBowls || review.hadDogTreats || review.hadDogArea || review.hadDogMenu}
					<div class="mb-4">
						<p class="mb-2 text-sm font-medium text-gray-700">Dog amenities found:</p>
						<div class="flex flex-wrap gap-2">
							{#if review.hadWaterBowls}
								<Badge class="rounded-full px-2 py-1 text-xs">💧 Water bowls</Badge>
							{/if}
							{#if review.hadDogTreats}
								<Badge class="rounded-full px-2 py-1 text-xs">🦴 Dog treats</Badge>
							{/if}
							{#if review.hadDogArea}
								<Badge class="rounded-full px-2 py-1 text-xs">🐕 Dog area</Badge>
							{/if}
							{#if review.hadDogMenu}
								<Badge class="rounded-full px-2 py-1 text-xs">🍽️ Dog menu</Badge>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<div class="py-8">
		<Pagination.Root count={reviews.length} perPage={6}>
			{#snippet children({ pages, currentPage })}
				<Pagination.Content>
					<Pagination.Item>
						<Pagination.PrevButton>
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
								<Pagination.NextButton />
							</Pagination.Item>
						</Pagination.PrevButton>
					</Pagination.Item>
				</Pagination.Content>
			{/snippet}
		</Pagination.Root>
	</div>
</div>
