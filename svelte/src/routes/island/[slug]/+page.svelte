<script lang="ts">
	import { api } from '$lib/api/index.js';
	import Breadcrumbs from '$lib/components/breadcrumbs.svelte';
	import MainNavbar from '$lib/components/main-navbar.svelte';
	import { getNameFromSlug } from '$lib/helpers/index.js';
	import { Loader2 } from '@lucide/svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import Button from '$lib/components/ui/button/button.svelte';

	let { data } = $props();
	const user = $derived(data.user);

	const island = createQuery({
		queryKey: ['island', data.slug],
		queryFn: () => api.island.getIsland(data.slug)
	});
</script>

{#if $island.isError}
	<div>Error</div>
{/if}

{#if $island.isLoading}
	<div class="flex min-h-screen items-center justify-center">
		<Loader2 class="text-primary size-10 animate-spin" />
	</div>
{/if}

{#if $island.isSuccess}
	<div class="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
		<MainNavbar {user} currentPlace={getNameFromSlug(data.slug)} />
		<div class="py-2 lg:flex lg:items-center lg:justify-between">
			<div class="min-w-0 flex-1">
				<Breadcrumbs type="island" islandName={$island.data.name} />
				<h2
					class="mt-4 text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight"
				>
					{$island.data.name}
				</h2>
				<div class="min-width-full relative my-5 flex justify-center">
					<img
						src={$island.data.image}
						alt={$island.data.name}
						class="h-[30rem] w-full rounded-lg object-cover object-center"
					/>
				</div>
				<div class="my-6">
					<Carousel.Root
						class="w-full"
						opts={{
							align: 'start',
							loop: false,
							dragFree: true
						}}
					>
						<!-- Header with navigation -->
						<div class="mb-4 flex items-center justify-between">
							<h2 class="text-2xl font-semibold">Popular homes in {$island.data.name}</h2>
							<div class="flex items-center gap-2">
								<Carousel.Previous class="static h-8 w-8 translate-x-0 translate-y-0" />
								<Carousel.Next class="static h-8 w-8 translate-x-0 translate-y-0" />
							</div>
						</div>

						<Carousel.Content class="-ml-2 md:-ml-4">
							{#each $island.data.regions as region, index}
								<Carousel.Item class="basis-[280px] pl-2 md:basis-[320px] md:pl-4">
									<Card.Root class="border-0 shadow-none">
										<div class="group relative cursor-pointer">
											<!-- Your card content here -->
											<div class="relative aspect-[4/3] overflow-hidden rounded-xl">
												<img
													src={region.image}
													alt={region.name}
													loading="lazy"
													class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
												/>
											</div>

											<div class="space-y-1 pt-3">
												<div class="flex items-center justify-between">
													<h3 class="truncate font-medium text-gray-900">{region.name}</h3>
												</div>
											</div>
										</div>
									</Card.Root>
								</Carousel.Item>
							{/each}
						</Carousel.Content>
					</Carousel.Root>
				</div>
			</div>
		</div>
	</div>
{/if}
