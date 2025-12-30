<script lang="ts">
	import { MapPin, Star, TrendingUp, Calendar, Shield, Users } from '@lucide/svelte';
</script>

<div class="bg-gray-50 py-24 sm:py-32">
	<div class="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
		<div class="text-center">
			<h2 class="text-primary text-base font-semibold leading-7">Business Features</h2>
			<p class="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
				Everything you need to grow your dog-friendly business
			</p>
		</div>

		<div class="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
			<!-- Feature 1: Claim & Manage -->
			<div class="relative lg:row-span-2">
				<div class="absolute inset-px rounded-lg bg-white lg:rounded-l-[2rem]"></div>
				<div
					class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] lg:rounded-l-[calc(2rem+1px)]"
				>
					<div class="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
						<div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
							<MapPin class="text-primary h-6 w-6" />
						</div>
						<p class="mt-4 text-lg font-medium tracking-tight text-gray-950">
							Claim or Create Places
						</p>
						<p class="mt-2 max-w-lg text-sm leading-6 text-gray-600">
							Take control of your business profile. Claim existing places or create new ones for
							all your locations. Update photos, hours, and dog-friendly amenities.
						</p>
					</div>
					<div class="relative min-h-[30rem] w-full grow">
						<div
							class="from-primary/10 absolute bottom-0 left-10 right-0 top-10 overflow-hidden rounded-tl-xl bg-gradient-to-br to-amber-100 shadow-2xl"
						>
							<!-- Mockup of business dashboard -->
							<div class="flex h-full flex-col p-6">
								<div class="space-y-3">
									<div class="h-20 rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5"></div>
									<div class="h-20 rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5"></div>
									<div class="h-20 rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div
					class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 lg:rounded-l-[2rem]"
				></div>
			</div>

			<!-- Feature 2: Priority Placement -->
			<div class="relative max-lg:row-start-1">
				<div class="absolute inset-px rounded-lg bg-white max-lg:rounded-t-[2rem]"></div>
				<div
					class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]"
				>
					<div class="px-8 pt-8 sm:px-10 sm:pt-10">
						<div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
							<TrendingUp class="text-primary h-6 w-6" />
						</div>
						<p class="mt-4 text-lg font-medium tracking-tight text-gray-950">Priority Placement</p>
						<p class="mt-2 max-w-lg text-sm leading-6 text-gray-600">
							Stand out in search results. Premium members appear first when dog owners search for
							venues in your area.
						</p>
					</div>
					<div
						class="flex flex-1 items-center justify-center px-8 max-lg:pb-12 max-lg:pt-10 sm:px-10 lg:pb-2"
					>
						<!-- Visual representation of priority placement -->
						<div class="w-full space-y-2">
							<div
								class="border-primary bg-primary/5 flex items-center gap-2 rounded-lg border-2 p-3"
							>
								<Star class="fill-primary text-primary h-5 w-5" />
								<span class="text-sm font-medium">Your Business</span>
							</div>
							<div class="rounded-lg bg-gray-100 p-3 opacity-50">
								<span class="text-sm text-gray-600">Competitor</span>
							</div>
							<div class="rounded-lg bg-gray-100 p-3 opacity-50">
								<span class="text-sm text-gray-600">Competitor</span>
							</div>
						</div>
					</div>
				</div>
				<div
					class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-t-[2rem]"
				></div>
			</div>

			<!-- Feature 3: Multiple Locations -->
			<div class="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
				<div class="absolute inset-px rounded-lg bg-white"></div>
				<div
					class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)]"
				>
					<div class="px-8 pt-8 sm:px-10 sm:pt-10">
						<div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
							<Users class="text-primary h-6 w-6" />
						</div>
						<p class="mt-4 text-lg font-medium tracking-tight text-gray-950">Multiple Locations</p>
						<p class="mt-2 max-w-lg text-sm leading-6 text-gray-600">
							Manage all your venues from one dashboard. Perfect for chains and multi-location
							businesses.
						</p>
					</div>
					<div class="flex flex-1 items-center px-8 max-lg:py-6 sm:px-10 lg:pb-2">
						<div class="w-full space-y-2">
							<div
								class="flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm"
							>
								<span class="text-sm">Auckland CBD</span>
								<span class="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
									>Active</span
								>
							</div>
							<div
								class="flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm"
							>
								<span class="text-sm">Ponsonby</span>
								<span class="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
									>Active</span
								>
							</div>
							<div
								class="flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm"
							>
								<span class="text-sm">Newmarket</span>
								<span class="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700"
									>Pending</span
								>
							</div>
						</div>
					</div>
				</div>
				<div
					class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5"
				></div>
			</div>

			<!-- Feature 4: Analytics & Insights -->
			<div class="relative lg:row-span-2">
				<div
					class="absolute inset-px rounded-lg bg-white max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"
				></div>
				<div
					class="relative flex h-full flex-col overflow-hidden rounded-[calc(theme(borderRadius.lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]"
				>
					<div class="px-8 pb-3 pt-8 sm:px-10 sm:pb-0 sm:pt-10">
						<div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
							<Star class="text-primary h-6 w-6" />
						</div>
						<p class="mt-4 text-lg font-medium tracking-tight text-gray-950">
							Reviews & Reputation
						</p>
						<p class="mt-2 max-w-lg text-sm leading-6 text-gray-600">
							Build trust with dog owners. Respond to reviews, showcase your best feedback, and
							track your reputation over time.
						</p>
					</div>
					<div class="relative min-h-[30rem] w-full grow">
						<div
							class="absolute bottom-0 left-10 right-0 top-10 overflow-hidden rounded-tl-xl bg-white shadow-2xl ring-1 ring-gray-900/10"
						>
							<!-- Review mockup -->
							<div class="p-6">
								<div class="mb-4 flex items-center justify-between">
									<div>
										<div class="text-3xl font-bold">4.8</div>
										<div class="text-sm text-gray-600">Average rating</div>
									</div>
									<div class="flex gap-1">
										<Star class="h-5 w-5 fill-amber-400 text-amber-400" />
										<Star class="h-5 w-5 fill-amber-400 text-amber-400" />
										<Star class="h-5 w-5 fill-amber-400 text-amber-400" />
										<Star class="h-5 w-5 fill-amber-400 text-amber-400" />
										<Star class="h-5 w-5 fill-gray-300 text-gray-300" />
									</div>
								</div>
								<div class="space-y-3">
									<div class="rounded-lg bg-gray-50 p-3">
										<div class="mb-1 flex items-center gap-2">
											<div class="h-6 w-6 rounded-full bg-gray-300"></div>
											<div class="text-xs font-medium">Sarah & Max</div>
										</div>
										<div class="text-xs text-gray-600">"Perfect spot for coffee with my pup!"</div>
									</div>
									<div class="rounded-lg bg-gray-50 p-3">
										<div class="mb-1 flex items-center gap-2">
											<div class="h-6 w-6 rounded-full bg-gray-300"></div>
											<div class="text-xs font-medium">James & Bella</div>
										</div>
										<div class="text-xs text-gray-600">"Water bowls and treats provided!"</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div
					class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"
				></div>
			</div>
		</div>
	</div>
</div>
