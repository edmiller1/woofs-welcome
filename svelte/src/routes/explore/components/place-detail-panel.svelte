<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		X,
		Share2,
		MapPin,
		Phone,
		Mail,
		Globe,
		Star,
		Trees,
		ExternalLink,
		BadgeCheck,
		House,
		Copy,
		Heart,
		LoaderCircle
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import type { BAUser, PlaceWithOptimizedImages } from '$lib/types/models';
	import { getCurrentDayStatus, orderHoursByDay } from '$lib/helpers';
	import { cn } from '$lib/utils';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { api } from '$lib/api';

	interface Props {
		place: PlaceWithOptimizedImages;
		onClose: () => void;
		mapboxToken: string;
		user: BAUser | null;
		openAuthModal: () => void;
		searchParams: URLSearchParams;
	}

	let { place, onClose, mapboxToken, user, openAuthModal, searchParams }: Props = $props();

	const queryClient = useQueryClient();

	const favouritePlace = createMutation({
		mutationFn: api.place.favouritePlace,
		onSuccess: (data) => {
			toast.success(`Place ${data.action === 'added' ? 'added to' : 'removed from'} favourites`);
			queryClient.invalidateQueries({
				queryKey: ['explore-places', searchParams]
			});
		},
		onError: (error) => {
			toast.error(`Operation failed: ${error.message}`);
		}
	});

	// Tabs
	let activeTab = $state<'overview' | 'reviews' | 'about'>('overview');

	const images = $derived(place.images.length > 0 ? place.images : []);

	// Get static map URL
	const mapUrl = $derived(() => {
		if (!place.latitude || !place.longitude) return null;
		return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+4568d9(${place.longitude},${place.latitude})/${place.longitude},${place.latitude},14,0/300x200?access_token=${mapboxToken}`;
	});

	// Handle escape key
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}

	const copyToClipboard = () => {
		navigator.clipboard.writeText(page.url.href);
		toast.success('Link copied to clipboard');
	};

	const shareViaEmail = () => {
		const subject = encodeURIComponent(`Check out ${place.name} on Woofs Welcome`);
		const body = encodeURIComponent(`Check out ${place.name} on Woofs Welcome: ${page.url.href}`);

		window.location.href = `mailto:?subject=${subject}&body=${body}`;
	};
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Panel Container -->
<div class="h-full w-full overflow-y-auto bg-white">
	<!-- Header with Close and Share -->
	<div class="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
		<h2 class="flex-1 truncate text-xl font-semibold">{place.name}</h2>
		<div class="flex items-center gap-2">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="ghost" size="icon">
						<Share2 class="h-5 w-5" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Group>
						<DropdownMenu.Item onclick={shareViaEmail}><Mail />Email</DropdownMenu.Item>
						<DropdownMenu.Item onclick={copyToClipboard}><Copy /> Copy Link</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<Button
				variant="ghost"
				size="icon"
				disabled={$favouritePlace.isPending}
				onclick={user ? () => $favouritePlace.mutate(place.id) : openAuthModal}
			>
				{#if $favouritePlace.isPending}
					<LoaderCircle class="h-5 w-5 animate-spin" />
				{:else}
					<Heart class={cn('h-5 w-5', place.hasFavourited && 'fill-rose-500 text-rose-500')} />
				{/if}
			</Button>
			<Button variant="ghost" size="icon" onclick={onClose}>
				<X class="h-5 w-5" />
			</Button>
		</div>
	</div>

	<!-- images -->
	<div
		class="group/gallery mt-3 grid h-[300px] grid-cols-3 grid-rows-2 gap-2 overflow-hidden rounded-lg p-2 group-hover/gallery:overflow-visible"
	>
		<div class="group relative col-span-2 row-span-2 cursor-pointer">
			{#if images[0]}
				<img
					src={images[0].url}
					alt={images[0].altText}
					class="h-full w-full rounded-l-lg object-cover transition duration-300 group-hover:brightness-90"
				/>
			{/if}
		</div>

		{#if images[1]}
			<div class="group relative row-span-1 cursor-pointer">
				<img
					src={images[1].url}
					alt={images[1].altText}
					class="h-full w-full rounded-tr-lg object-cover transition duration-300 group-hover:brightness-90"
				/>
			</div>
		{/if}

		{#if images[2]}
			<div class="group relative row-span-1 cursor-pointer">
				<img
					src={images[2].url}
					alt={images[2].altText}
					class="h-full w-full rounded-br-lg object-cover transition duration-300 group-hover:brightness-90"
				/>
			</div>
		{/if}
	</div>

	<!-- Content -->
	<div class="p-4">
		<div>
			<div class="mb-2 flex items-start justify-between gap-4">
				<div class="flex-1">
					<h1 class="mb-1 text-2xl font-bold">{place.name}</h1>
					<div class="text-muted-foreground flex items-center gap-1.5">
						<MapPin class="h-4 w-4" />
						<span>{place.city.name}, {place.city.region.name}</span>
					</div>
					{#if place.activeClaim}
						<BadgeCheck class="size-8 text-white sm:inline-block" fill="oklch(0.63 0.17 149)" />
					{/if}
				</div>

				<!-- Rating -->
				<div class="mt-1 flex items-center gap-2">
					<div class="flex items-center gap-1">
						<Star class="h-5 w-5 fill-yellow-400 text-yellow-400" />
						<span class="text-lg font-semibold">
							{Number(place.rating).toFixed(1)}
						</span>
						{#if place.reviewsCount > 0}
							<span class="text-muted-foreground">
								({place.reviewsCount}
								{place.reviewsCount === 1 ? 'review' : 'reviews'})
							</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- Tabs -->
			<div class="border-b">
				<div class="flex gap-6">
					<button
						onclick={() => (activeTab = 'overview')}
						class={`cursor-pointer border-b-2 pb-3 font-medium transition-colors ${
							activeTab === 'overview'
								? 'border-primary text-primary'
								: 'text-muted-foreground hover:text-foreground border-transparent'
						}`}
					>
						Overview
					</button>
					<button
						onclick={() => (activeTab = 'about')}
						class={`cursor-pointer border-b-2 pb-3 font-medium transition-colors ${
							activeTab === 'about'
								? 'border-primary text-primary'
								: 'text-muted-foreground hover:text-foreground border-transparent'
						}`}
					>
						About
					</button>
					<button
						onclick={() => (activeTab = 'reviews')}
						class={`cursor-pointer border-b-2 pb-3 font-medium transition-colors ${
							activeTab === 'reviews'
								? 'border-primary text-primary'
								: 'text-muted-foreground hover:text-foreground border-transparent'
						}`}
					>
						Reviews
					</button>
				</div>
			</div>

			<!-- Tab Content -->
			{#if activeTab === 'overview'}
				<!-- Description -->
				{#if place.description}
					<div class="my-3">
						<h3 class="mb-2 text-lg font-semibold">Description</h3>
						<p class="text-muted-foreground text-sm leading-relaxed">
							{place.description}
						</p>
					</div>
				{/if}

				<!-- Dog Access -->
				{#if place.indoorAllowed || place.outdoorAllowed}
					<div>
						<h3 class="mb-3 text-lg font-semibold">Dog Access</h3>
						<div class="flex gap-4">
							{#if place.indoorAllowed}
								<div class="flex flex-1 items-center gap-2 rounded-lg bg-blue-50 px-4 py-3">
									<div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
										<House class="h-4 w-4 text-blue-700" />
									</div>
									<span class="font-medium text-blue-900">Indoor Allowed</span>
								</div>
							{/if}
							{#if place.outdoorAllowed}
								<div class="flex flex-1 items-center gap-2 rounded-lg bg-green-50 px-4 py-3">
									<div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
										<Trees class="h-4 w-4 text-green-700" />
									</div>
									<span class="font-medium text-green-900">Outdoor Allowed</span>
								</div>
							{/if}
						</div>
						{#if place.dogPolicy}
							<p class="text-muted-foreground mt-3 text-sm">
								{place.dogPolicy}
							</p>
						{/if}
					</div>
				{/if}

				<!-- Contact Information -->
				{#if place.phone || place.email || place.website}
					<div class="my-3">
						<h3 class="mb-3 text-lg font-semibold">Contact</h3>
						<div class="space-y-2">
							{#if place.phone}
								<a
									href={`tel:${place.phone}`}
									class="text-muted-foreground hover:text-foreground flex items-center gap-3 text-sm transition-colors hover:underline"
								>
									<Phone class="h-4 w-4" />
									<span>{place.phone}</span>
								</a>
							{/if}
							{#if place.email}
								<a
									href={`mailto:${place.email}`}
									class="text-muted-foreground hover:text-foreground flex items-center gap-3 text-sm transition-colors"
								>
									<Mail class="h-4 w-4" />
									<span>{place.email}</span>
								</a>
							{/if}
							{#if place.website}
								<a
									href={place.website}
									target="_blank"
									rel="noopener noreferrer"
									class="text-muted-foreground hover:text-foreground flex items-center gap-3 transition-colors hover:underline"
								>
									<Globe class="h-4 w-4" />
									<span class="flex flex-1 items-center gap-2 truncate text-sm"
										>website <ExternalLink class="h-3 w-3" />
									</span>
								</a>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Map -->
				{#if mapUrl()}
					<div class="my-3">
						<h3 class="mb-3 text-lg font-semibold">Location</h3>
						{#if place.address}
							<p class="text-muted-foreground mb-3 text-sm">{place.address}</p>
						{/if}
						<div class="overflow-hidden rounded-lg border">
							<img
								src={mapUrl()}
								alt={`Map showing location of ${place.name}`}
								class="h-64 w-full object-cover"
							/>
						</div>
					</div>
				{/if}
			{:else if activeTab === 'about'}
				<!-- About / Additional Info -->
				<div class="my-4 space-y-4">
					<div class="flex flex-wrap gap-2">
						{#each place.types as type}
							<Badge>{type}</Badge>
						{/each}
					</div>

					{#if place.hours}
						<div>
							<h3 class="mb-2 font-semibold">Hours</h3>
							<div class="text-muted-foreground text-sm">
								{#if getCurrentDayStatus(place.hours)}
									{@const status = getCurrentDayStatus(place.hours)}
									<div class="flex items-center gap-2">
										{#if status?.includes('Open till')}
											<span class="relative flex size-2">
												<span
													class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-600 opacity-75"
												></span>
												<span class="relative inline-flex size-2 rounded-full bg-green-500"></span>
											</span>
										{/if}
										<span
											class="text-sm font-semibold {status?.includes('Open till')
												? 'text-green-600'
												: status?.includes('Closed')
													? 'text-red-800'
													: 'text-orange-600'}"
										>
											{status}
										</span>
									</div>
								{/if}
								<div class="my-2 space-y-2 rounded-lg border">
									{#each orderHoursByDay(place.hours) as day}
										{@const isToday =
											day.day === new Date().toLocaleDateString('en-AU', { weekday: 'long' })}
										<div
											class="flex items-center justify-between rounded px-4 py-2 {isToday
												? 'border-primary/20 bg-primary/10 border'
												: ''}"
										>
											<span class="font-medium {isToday ? 'text-primary' : 'text-foreground'}"
												>{day.day}</span
											>
											<span class={isToday ? 'text-primary font-medium' : 'text-muted-foreground'}
												>{day.hours}</span
											>
										</div>
									{/each}
								</div>
							</div>
						</div>
					{/if}
				</div>
			{:else if activeTab === 'reviews'}
				<!-- Reviews -->
				{#if place.reviews && place.reviews.length > 0}
					<div class="space-y-4">
						{#each place.reviews as review}
							<div class="border-b pb-4 last:border-0">
								<div class="mb-2 flex items-start gap-3">
									<div
										class="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
									>
										{#if review.user.image}
											<img
												src={review.user.image}
												alt={review.user.name || 'User'}
												class="h-10 w-10 rounded-full"
											/>
										{:else}
											<span class="text-sm font-semibold">
												{(review.user.name || 'U')[0].toUpperCase()}
											</span>
										{/if}
									</div>
									<div class="flex-1">
										<div class="flex items-center justify-between">
											<p class="font-semibold">{review.user.name || 'Anonymous'}</p>
											<div class="flex items-center gap-1">
												<Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
												<span class="text-sm font-medium">{review.rating}</span>
											</div>
										</div>
										<p class="text-muted-foreground text-xs">
											{new Date(review.createdAt).toLocaleDateString()}
										</p>
									</div>
								</div>
								{#if review.content}
									<p class="text-muted-foreground mt-2">{review.content}</p>
								{/if}
							</div>
						{/each}

						<!-- View All Reviews Button -->
						<Button variant="outline" class="w-full" onclick={() => goto(`/place/${place.slug}`)}>
							View All {place.reviewsCount} Reviews
						</Button>
					</div>
				{:else}
					<div class="text-muted-foreground py-8 text-center">
						<p>No reviews yet. Be the first to review!</p>
						<a
							href={`/review/${place.slug}`}
							class={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}
							target="_blank"
						>
							Write a Review
						</a>
					</div>
				{/if}
			{/if}

			<a href={`/place/${place.slug}`} class={cn(buttonVariants({ variant: 'default' }), 'w-full')}>
				View Full Details
			</a>
		</div>
	</div>
</div>
