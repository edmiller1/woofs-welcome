<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { ArrowRight } from '@lucide/svelte';
	import fluffs from '$lib/assets/fluffs.jpg';
</script>

<div class="relative min-h-screen overflow-hidden">
	<!-- Background image with diagonal clip -->
	<div class="absolute inset-0">
		<div class="business-hero-background">
			<div class="absolute inset-0 bg-black/20"></div>
		</div>
	</div>

	<div class="relative z-10 flex min-h-screen items-center">
		<div class="container mx-auto px-4 py-12">
			<div class="grid items-center gap-8 lg:grid-cols-2">
				<div class="max-w-lg space-y-8">
					<h1 class="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
						Have a dog-friendly business?
					</h1>
					<p class="text-muted-foreground text-lg leading-relaxed">
						Create or claim your business and join our amazing dog-friendly community. Update your
						business profile, add photos and create events.
					</p>

					<div class="flex flex-col gap-4 sm:flex-row">
						<a href="/business/sign-in">
							<Button
								variant="default"
								size="lg"
								class="w-full px-8 py-3 text-base font-semibold sm:w-auto"
								>Sign in
							</Button>
						</a>
						<a href="/business/sign-up">
							<Button
								variant="ghost"
								size="lg"
								class="group w-full justify-center px-0 text-base font-semibold sm:w-auto sm:justify-start"
							>
								Create an account
								<ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
							</Button>
						</a>
					</div>
				</div>

				<div class="hidden lg:block"></div>
			</div>
		</div>
	</div>

	<div class="absolute inset-0 bg-gradient-to-br from-white via-white/95 to-white/80 lg:hidden">
		<img
			src={fluffs}
			alt="business professional"
			class="object-cover opacity-20 mix-blend-soft-light"
		/>
	</div>
</div>
