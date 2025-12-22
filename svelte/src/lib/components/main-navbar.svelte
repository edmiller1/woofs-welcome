<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import {
		Bell,
		Coffee,
		Footprints,
		Hotel,
		Map,
		MapPin,
		Menu,
		ShoppingBag,
		Stethoscope,
		Ticket,
		Trees,
		Utensils,
		Waves
	} from '@lucide/svelte';
	import { Button, buttonVariants } from './ui/button';
	import UserNav from './user-nav.svelte';
	import type { BAUser } from '$lib/types/user';

	interface Props {
		user: BAUser | null;
		currentPlace?: string;
	}

	const { currentPlace, user }: Props = $props();
</script>

<header class="bg-background">
	<div class="mx-auto border-b">
		<div class="relative flex h-16 justify-between gap-2">
			<a href="/" class="relative z-10 flex px-2 lg:px-0">
				<div class="flex shrink-0 items-center gap-2">
					<img
						class="h-8 w-auto"
						src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
						alt="Woofs Welcome"
					/>
					<h1 class="hidden text-lg font-semibold md:block">Woofs Welcome</h1>
				</div>
			</a>
			<div class="relative z-0 flex flex-1 items-center justify-center px-2 sm:absolute sm:inset-0">
				<!-- Search Input -->
				<div class="grid w-full grid-cols-1 sm:max-w-xs">
					<input
						type="search"
						name="search"
						class="col-start-1 row-start-1 block w-full rounded-full border-2 bg-white py-1.5 pl-10 pr-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
						placeholder="Search"
					/>
					<svg
						class="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
						data-slot="icon"
					>
						<path
							fill-rule="evenodd"
							d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
			</div>
			<div class="relative z-10 flex items-center lg:hidden">
				<Sheet.Root>
					<Sheet.Trigger class={`${buttonVariants({ variant: 'ghost' })} ml-5`}>
						<Menu class="size-6" />
					</Sheet.Trigger>
					<Sheet.Content side="right" class="flex flex-col gap-2 p-4">
						<ul class="mt-5 border-b px-4 py-2">
							{#if currentPlace}
								<li class="my-3">
									<div class="flex items-center gap-2 rounded-lg capitalize">
										<Map />
										{currentPlace}
									</div>
								</li>
							{/if}
							<li class="my-3">
								<a href="/" class="hover:bg-secondary flex items-center gap-2 rounded-lg px-2 py-1">
									Things to Do
								</a>
							</li>
							<li class="my-3">
								<a href="/" class="hover:bg-secondary flex items-center gap-2 rounded-lg px-2 py-1">
									Accommodation
								</a>
							</li>
							<li class="my-3">
								<a href="/" class="hover:bg-secondary flex items-center gap-2 rounded-lg px-2 py-1">
									Retail
								</a>
							</li>
							<li class="my-3">
								<a href="/" class="hover:bg-secondary flex items-center gap-2 rounded-lg px-2 py-1">
									Reataurants
								</a>
							</li>
							<li class="my-3">
								<a href="/" class="hover:bg-secondary flex items-center gap-2 rounded-lg px-2 py-1">
									Cafés
								</a>
							</li>
							<li class="my-3">
								<a href="/" class="hover:bg-secondary flex items-center gap-2 rounded-lg px-2 py-1">
									Services
								</a>
							</li>
							<li class="my-3">
								<a href="/" class="hover:bg-secondary flex items-center gap-2 rounded-lg px-2 py-1">
									Parks
								</a>
							</li>
							<li class="my-3">
								<a href="/" class="hover:bg-secondary flex items-center gap-2 rounded-lg px-2 py-1">
									Beaches
								</a>
							</li>
							<li class="my-3">
								<a href="/" class="hover:bg-secondary flex items-center gap-2 rounded-lg px-2 py-1">
									Walks
								</a>
							</li>
							<li class="my-3">
								<a href="/" class="hover:bg-secondary flex items-center gap-2 rounded-lg px-2 py-1">
									Events
								</a>
							</li>
						</ul>
						{#if user}
							<ul class="border-b px-4 py-2">
								<li class="my-3">
									<a
										href="/profile"
										class="hover:bg-secondary flex items-center gap-2 rounded-lg px-2 py-1"
									>
										Profile
									</a>
								</li>
								<li class="my-3">
									<a
										href="/account/favourites"
										class="hover:bg-secondary flex items-center gap-2 rounded-lg px-2 py-1"
									>
										Favourites
									</a>
								</li>
								<li class="my-3">
									<a
										href="/sign-out"
										class="hover:bg-secondary flex items-center gap-2 rounded-lg px-2 py-1"
									>
										Account Settings
									</a>
								</li>
							</ul>
							<div class="mt-5">
								<Button class="w-full">Sign out</Button>
							</div>
						{:else}
							<div class="mt-5"><Button class="w-full">Sign in</Button></div>
						{/if}
					</Sheet.Content>
				</Sheet.Root>
			</div>

			<div class="hidden lg:relative lg:z-10 lg:ml-4 lg:flex lg:items-center">
				<div class={`${buttonVariants({ variant: 'ghost' })} relative shrink-0 rounded-full p-1`}>
					<Bell class="size-6" />
				</div>
				<div class="relative ml-4 shrink-0">
					{#if user}
						<UserNav {user} />
					{:else}
						<Button>Sign in</Button>
					{/if}
				</div>
			</div>
		</div>
		<nav class="hidden lg:flex lg:space-x-4 lg:py-2" aria-label="Global">
			<a href="/" class="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-1">
				<MapPin class="size-4" />
				<span class=" text-sm font-medium"> Things to Do</span>
			</a>
			<a href="/" class="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2">
				<Hotel class="size-4" />
				<span class=" text-sm font-medium"> Accommodation</span>
			</a>
			<a href="/" class="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2">
				<ShoppingBag class="size-4" />
				<span class=" text-sm font-medium"> Retail</span>
			</a>
			<a href="/" class="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2">
				<Utensils class="size-4" />
				<span class=" text-sm font-medium"> Restaurants</span>
			</a>
			<a href="/" class="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2">
				<Coffee class="size-4" />
				<span class=" text-sm font-medium"> Cafés</span>
			</a>
			<a href="/" class="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2">
				<Stethoscope class="size-4" />
				<span class=" text-sm font-medium"> Services</span>
			</a>
			<a href="/" class="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2">
				<Trees class="size-4" />
				<span class=" text-sm font-medium"> Parks</span>
			</a>
			<a href="/" class="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2">
				<Waves class="size-4" />
				<span class=" text-sm font-medium"> Beaches</span>
			</a>
			<a href="/" class="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2">
				<Footprints class="size-4" />
				<span class=" text-sm font-medium"> Walks</span>
			</a>
			<a href="/" class="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2">
				<Ticket class="size-4" />
				<span class=" text-sm font-medium"> Events</span>
			</a>
		</nav>
	</div>
</header>
