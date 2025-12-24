<script lang="ts">
	import { api } from '$lib/api';
	import type { BAUser } from '$lib/types/user';
	import { createQuery } from '@tanstack/svelte-query';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { getUserInitials } from '$lib/helpers';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Heart, Star } from '@lucide/svelte';

	interface Props {
		data: {
			user: BAUser;
		};
	}

	let { data }: Props = $props();

	const { user } = data;

	const profileStats = createQuery({
		queryKey: ['profile-stats'],
		queryFn: () => api.auth.getProfileStats()
	});

	const recentReviews = createQuery({
		queryKey: ['profile-reviews'],
		queryFn: () => api.auth.getProfileReviews(5, 0)
	});

	const recentFavourites = createQuery({
		queryKey: ['profile-favorites'],
		queryFn: () => api.auth.getProfileFavourites(5, 0)
	});

	// Format the member since date
	const formatMemberSince = (date: string | Date) => {
		return new Date(date).toLocaleDateString('en-NZ', {
			month: 'long',
			year: 'numeric'
		});
	};
</script>

<div class="max-w-3xl">
	<div class="mb-6">
		<h1 class="mb-2 text-2xl font-bold">Profile</h1>
		<Separator class="mb-6" />
		{#if $profileStats.isSuccess}
			<div class="flex items-start gap-6">
				<div class="flex-shrink-0">
					<Avatar.Root class="size-24">
						<Avatar.Image src={user.image} alt="Profile image" class="object-cover object-center" />
						<Avatar.Fallback>{getUserInitials(user.name)}</Avatar.Fallback>
					</Avatar.Root>
				</div>
				<div class="flex-1">
					<h1 class="mb-2 text-lg font-bold">{user.name}</h1>
					<p class="text-muted-foreground mb-2 text-sm">{user.email}</p>
					{#if $profileStats.data?.memberSince}
						<p class="text-sm text-gray-500">
							Member since {formatMemberSince($profileStats.data.memberSince)}
						</p>
					{/if}
				</div>
			</div>

			<a href="/profile/settings" class={cn(buttonVariants({ variant: 'outline' }), 'mt-5')}>
				Edit Profile
			</a>
		{/if}
	</div>

	<!-- Stats Cards -->
	{#if $profileStats.isLoading}
		<div class="mb-8 grid grid-cols-2 gap-4">
			<!-- Loading skeletons -->
			<div class="h-24 animate-pulse rounded-lg bg-gray-100 p-6"></div>
			<div class="h-24 animate-pulse rounded-lg bg-gray-100 p-6"></div>
		</div>
	{:else if $profileStats.isSuccess}
		<div class="mb-8 grid grid-cols-2 gap-4">
			<!-- Reviews Card -->
			<div class="rounded-lg border border-gray-200 bg-white p-6">
				<div class="mb-2 flex items-center gap-3">
					<Star class="h-6 w-6 text-yellow-500" fill="currentColor" />
					<div class="text-3xl font-bold text-gray-900">
						{$profileStats.data.reviewCount}
					</div>
				</div>
				<div class="text-sm text-gray-600">
					{$profileStats.data.reviewCount === 1 ? 'Review' : 'Reviews'}
				</div>
			</div>

			<!-- Favourites Card -->
			<div class="rounded-lg border border-gray-200 bg-white p-6">
				<div class="mb-2 flex items-center gap-3">
					<Heart class="h-6 w-6 text-rose-500" fill="currentColor" />
					<div class="text-3xl font-bold text-gray-900">
						{$profileStats.data.favouriteCount}
					</div>
				</div>
				<div class="text-sm text-gray-600">
					{$profileStats.data.favouriteCount === 1 ? 'Favourite' : 'Favourites'}
				</div>
			</div>
		</div>
	{/if}

	<!-- Recent Activity Section - we'll add this next -->
	<div class="space-y-6">
		<h2 class="text-xl font-semibold">Recent Activity</h2>
		<div class="grid grid-cols-2 gap-6">
			<div>
				<div class="mb-4 flex items-center justify-between">
					<h3 class="flex items-center gap-2 text-lg font-semibold">
						<Star class="h-5 w-5 text-yellow-500" fill="currentColor" />
						Recent Reviews
					</h3>
					{#if $recentReviews.data && $recentReviews.data.total > 5}
						<a href="/profile/reviews" class={cn(buttonVariants({ variant: 'link' }), 'text-sm')}>
							View all {$recentReviews.data.total} reviews →
						</a>
					{/if}
				</div>

				{#if $recentReviews.isLoading}
					<div class="space-y-3">
						{#each Array(3) as _}
							<div class="h-24 animate-pulse rounded-lg bg-gray-100 p-4"></div>
						{/each}
					</div>
				{:else if $recentReviews.data?.data && $recentReviews.data.data.length > 0}
					<div class="space-y-3">
						{#each $recentReviews.data.data as review}
							<a
								href="/place/{review.place.slug}#reviews"
								class="block rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300"
							>
								<div class="mb-1 font-semibold text-gray-900">
									{review.place.name}
								</div>
								<div class="mb-2 flex items-center gap-2">
									<div class="flex">
										{#each Array(5) as _, i}
											<Star
												class="h-4 w-4 {i < review.rating
													? 'fill-yellow-500 text-yellow-500'
													: 'text-gray-300'}"
											/>
										{/each}
									</div>
									<span class="text-sm text-gray-500">
										{new Date(review.createdAt).toLocaleDateString('en-NZ')}
									</span>
								</div>
								{#if review.title}
									<p class="mb-1 font-medium text-gray-800">{review.title}</p>
								{/if}
								{#if review.content}
									<p class="line-clamp-2 text-sm text-gray-600">
										{review.content}
									</p>
								{/if}
							</a>
						{/each}
					</div>
				{:else}
					<div class="py-8 text-center text-gray-500">
						<Star class="mx-auto mb-2 h-12 w-12 text-gray-300" />
						<p>No reviews yet</p>
						<a href="/explore" class={cn(buttonVariants({ variant: 'link' }), 'mt-3 text-sm')}>
							Write your first review
						</a>
					</div>
				{/if}
			</div>

			<!-- Recent Favourites Column -->
			<div>
				<div class="mb-4 flex items-center justify-between">
					<h3 class="flex items-center gap-2 text-lg font-semibold">
						<Heart class="h-5 w-5 text-rose-500" fill="currentColor" />
						Recent Favourites
					</h3>
					{#if $recentFavourites.data && $recentFavourites.data.total > 5}
						<a
							href="/profile/favourites"
							class={cn(buttonVariants({ variant: 'link' }), 'text-sm')}
						>
							View all {$recentFavourites.data.total} favourites →
						</a>
					{/if}
				</div>

				{#if $recentFavourites.isLoading}
					<div class="space-y-3">
						{#each Array(3) as _}
							<div class="h-24 animate-pulse rounded-lg bg-gray-100 p-4"></div>
						{/each}
					</div>
				{:else if $recentFavourites.data?.data && $recentFavourites.data.data.length > 0}
					<div class="space-y-3">
						{#each $recentFavourites.data.data as place}
							<a
								href="/place/{place.slug}"
								class="block rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300"
							>
								<div class="mb-1 font-semibold text-gray-900">
									{place.name}
								</div>
								<div class="text-sm text-gray-600">
									{place.city.name}, {place.city.region.name}
								</div>
							</a>
						{/each}
					</div>
				{:else}
					<div class="py-8 text-center text-gray-500">
						<Heart class="mx-auto mb-2 h-12 w-12 text-gray-300" />
						<p>No favourites yet</p>
						<a href="/explore" class={cn(buttonVariants({ variant: 'link' }), 'mt-3 text-sm')}>
							Find places to save
						</a>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
