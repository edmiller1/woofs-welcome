<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { ArrowRight, CircleCheck } from '@lucide/svelte';
	import fluffs from '$lib/assets/fluffs.jpg';
</script>

<div class="bg-mint relative overflow-hidden">
	<!-- Background gradient -->
	<div class="to-mint absolute inset-0 bg-gradient-to-br from-orange-50 via-white"></div>

	<div class="relative">
		<div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
			<div class="grid gap-12 lg:grid-cols-2 lg:gap-8">
				<!-- Left column: Content -->
				<div class="flex flex-col justify-center">
					<div class="max-w-xl">
						<h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
							Connect with dog lovers across New Zealand
						</h1>
						<p class="mt-6 text-lg leading-8 text-gray-600">
							Join hundreds of dog-friendly businesses reaching thousands of pet owners. Claim your
							venue, showcase what makes you special, and grow your customer base.
						</p>

						<!-- Key benefits -->
						<div class="mt-8 space-y-3">
							<div class="flex items-center gap-3">
								<CircleCheck class="text-primary h-5 w-5 flex-shrink-0" />
								<span class="text-sm text-gray-700">Priority placement in search results</span>
							</div>
							<div class="flex items-center gap-3">
								<CircleCheck class="text-primary h-5 w-5 flex-shrink-0" />
								<span class="text-sm text-gray-700">Manage multiple locations</span>
							</div>
							<div class="flex items-center gap-3">
								<CircleCheck class="text-primary h-5 w-5 flex-shrink-0" />
								<span class="text-sm text-gray-700">Respond to reviews and build trust</span>
							</div>
						</div>

						<!-- CTA buttons -->
						<div class="mt-10 flex flex-col gap-4 sm:flex-row">
							<a href="/sign-in?business=true" class="flex-1 sm:flex-initial">
								<Button size="lg" class="w-full px-8 sm:w-auto">
									Get Started Free
									<ArrowRight class="ml-2 h-4 w-4" />
								</Button>
							</a>
							<a href="#pricing" class="flex-1 sm:flex-initial">
								<Button variant="outline" size="lg" class="w-full sm:w-auto">View Pricing</Button>
							</a>
						</div>

						<p class="mt-4 text-sm text-gray-500">
							Already have an account? <a
								href="/sign-in?business=true"
								class="text-primary ml-1 font-semibold hover:underline">Sign in</a
							>
						</p>
					</div>
				</div>

				<!-- Right column: Image -->
				<div class="relative lg:flex lg:items-center">
					<div
						class="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-2xl lg:aspect-auto lg:h-[600px]"
					>
						<img src={fluffs} alt="Dog-friendly business" class="h-full w-full object-cover" />
					</div>

					<!-- Floating stat cards -->
					<div
						class="absolute -bottom-4 -right-4 rounded-lg bg-white p-4 shadow-lg ring-1 ring-gray-900/10 sm:p-6 lg:bottom-8 lg:right-8"
					>
						<div class="flex items-center gap-4">
							<div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
								<span class="text-2xl">🐕</span>
							</div>
							<div>
								<p class="text-2xl font-bold text-gray-900">12k+</p>
								<p class="text-sm text-gray-600">Monthly visitors</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
