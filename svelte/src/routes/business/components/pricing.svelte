<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { CheckIcon } from '@lucide/svelte';

	const INCLUDED_FEATURES = [
		'Priority placement in search results',
		'Manage multiple business locations',
		'Add and update business information',
		'Access to analytics and insights'
	];
</script>

<div class="bg-background py-24 sm:py-32">
	<div class="mx-auto h-full w-full max-w-screen-xl px-2.5 md:px-20">
		<div class="mx-auto max-w-2xl sm:text-center">
			<h1 class="text-primary text-center font-semibold">Simple one price for all</h1>
			<p class="mt-6 max-w-prose text-pretty text-center text-base/7 text-gray-600">
				Our business plan is designed to be straightforward and affordable, ensuring you can focus
				on what matters most—growing your dog-friendly business. Enjoy all the features without any
				hidden fees or complex pricing tiers.
			</p>
		</div>

		<div
			class="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none"
		>
			<div class="p-8 sm:p-10 lg:flex-auto">
				<h3 class="font-heading text-3xl font-semibold tracking-tight">Premium</h3>
				<p class="text-muted-foreground mt-6 text-base/7">
					Reach dog-lovers all throughout New Zealand with our premium plan. appear at the top of
					search results and gain more visibility on our homepage. Customise your business profile
					to match your brand and more.
				</p>
				<div class="mt-10 flex items-center gap-x-4">
					<h4 class="text-brand-600 flex-none text-sm font-semibold leading-6">What's included</h4>
					<div class="h-px flex-auto bg-gray-100"></div>
				</div>
				<ul class="mt-8 grid grid-cols-1 gap-4 text-sm/6 text-gray-600 sm:grid-cols-2 sm:gap-6">
					{#each INCLUDED_FEATURES as feature}
						<li class="flex gap-3">
							<CheckIcon class="text-primary h-6 w-5 flex-none" />
							{feature}
						</li>
					{/each}
				</ul>
			</div>

			<div class="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
				<div
					class="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16"
				>
					<div class="mx-auto max-w-xs py-8">
						<p class="text-base font-semibold text-gray-600">For only</p>
						<p class="mt-6 flex items-baseline justify-center gap-x-2">
							<span class="text-5xl font-bold tracking-tight text-gray-900"> $24 </span>
							<span class="text-sm font-semibold leading-6 tracking-wide text-gray-600">
								/Month
							</span>
						</p>

						<Button class="mt-6 px-20">Get Started</Button>
						<p class="mt-6 text-xs leading-5 text-gray-600">
							Secure payment. Start reaching in minutes.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
