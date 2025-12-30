<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { CheckIcon, Sparkles } from '@lucide/svelte';

	const INCLUDED_FEATURES = [
		'Priority placement in search results',
		'Claim and manage unlimited locations',
		'Full access to business dashboard',
		'Respond to customer reviews',
		'Upload and manage photos',
		'Update hours and amenities',
		'Analytics and insights (coming soon)',
		'Email support'
	];
</script>

<div id="pricing" class="bg-white py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<!-- Header -->
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-primary text-base font-semibold leading-7">Pricing</h2>
			<p class="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
				Simple, transparent pricing
			</p>
			<p class="mt-6 text-lg leading-8 text-gray-600">
				No hidden fees, no surprises. Start with a free trial and upgrade when you're ready.
			</p>
		</div>

		<!-- Pricing Cards -->
		<div class="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- Free Tier -->
			<div class="relative flex flex-col rounded-3xl bg-gray-50 p-8 ring-1 ring-gray-200">
				<div class="flex-1">
					<h3 class="text-2xl font-bold tracking-tight text-gray-900">Free</h3>
					<p class="mt-4 text-sm leading-6 text-gray-600">
						Perfect for getting started and testing the platform.
					</p>
					<p class="mt-6 flex items-baseline gap-x-1">
						<span class="text-5xl font-bold tracking-tight text-gray-900">$0</span>
						<span class="text-sm font-semibold leading-6 text-gray-600">/month</span>
					</p>

					<ul class="mt-8 space-y-3 text-sm leading-6 text-gray-600">
						<li class="flex gap-x-3">
							<CheckIcon class="text-primary h-6 w-5 flex-none" />
							Claim one location
						</li>
						<li class="flex gap-x-3">
							<CheckIcon class="text-primary h-6 w-5 flex-none" />
							Basic business profile
						</li>
						<li class="flex gap-x-3">
							<CheckIcon class="text-primary h-6 w-5 flex-none" />
							View and respond to reviews
						</li>
						<li class="flex gap-x-3">
							<CheckIcon class="text-primary h-6 w-5 flex-none" />
							Standard search listing
						</li>
					</ul>
				</div>

				<a href="/sign-in?business=true" class="mt-8">
					<Button variant="outline" size="lg" class="w-full">Start Free</Button>
				</a>
			</div>

			<!-- Premium Tier -->
			<div
				class="from-primary/5 ring-primary relative flex flex-col rounded-3xl bg-gradient-to-br to-amber-50 p-8 ring-2"
			>
				<!-- Popular badge -->
				<div class="absolute -top-4 left-1/2 -translate-x-1/2">
					<span
						class="bg-primary inline-flex items-center gap-1 rounded-full px-4 py-1 text-sm font-semibold text-white"
					>
						<Sparkles class="h-4 w-4" />
						Most Popular
					</span>
				</div>

				<div class="flex-1">
					<h3 class="text-2xl font-bold tracking-tight text-gray-900">Premium</h3>
					<p class="mt-4 text-sm leading-6 text-gray-600">
						Everything you need to stand out and grow your business.
					</p>
					<p class="mt-6 flex items-baseline gap-x-1">
						<span class="text-5xl font-bold tracking-tight text-gray-900">$24</span>
						<span class="text-sm font-semibold leading-6 text-gray-600">/month</span>
					</p>
					<p class="mt-2 text-sm text-gray-500">
						or $240/year <span class="text-primary font-semibold">(save $48)</span>
					</p>

					<div class="mt-8">
						<p class="text-sm font-semibold text-gray-900">Everything in Free, plus:</p>
						<ul class="mt-4 space-y-3 text-sm leading-6 text-gray-600">
							{#each INCLUDED_FEATURES.slice(0, 6) as feature}
								<li class="flex gap-x-3">
									<CheckIcon class="text-primary h-6 w-5 flex-none" />
									{feature}
								</li>
							{/each}
						</ul>
					</div>
				</div>

				<a href="/sign-up?business=true" class="mt-8">
					<Button size="lg" class="w-full">Start Free Trial</Button>
				</a>
				<p class="mt-4 text-center text-xs text-gray-600">
					14-day free trial • No credit card required
				</p>
			</div>
		</div>

		<!-- FAQ or additional info -->
		<div class="mx-auto mt-16 max-w-2xl text-center">
			<p class="text-sm text-gray-600">
				Need help choosing? <a
					href="mailto:support@woofswelcome.nz"
					class="text-primary font-semibold hover:underline">Contact our team</a
				> for personalized guidance.
			</p>
		</div>
	</div>
</div>
