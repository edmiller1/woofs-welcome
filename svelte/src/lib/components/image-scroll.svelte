<script lang="ts">
	import { cn } from '$lib/utils';
	import { Motion } from 'svelte-motion';

	interface Props {
		className?: string;
		images: { url: string; altText: string }[];
	}

	const { className, images }: Props = $props();

	let selected = $state<string | null>(null);
	let lastSelected = $state<string | null>(null);

	const handleSelect = (img: string) => {
		lastSelected = selected;
		selected = img;
	};

	const handleClickOutside = () => {
		lastSelected = selected;
		selected = null;
	};
</script>

<div class={cn('w-full items-start overflow-y-auto', className)}>
	<div
		class="mx-auto grid max-w-5xl grid-cols-1 items-start gap-5 px-10 md:grid-cols-2 lg:grid-cols-3"
	>
		{#each images as img}
			<div class="group">
				<Motion let:motion layout>
					<div
						role="button"
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								handleSelect(img.url);
							}
						}}
						tabindex="0"
						use:motion
						onclick={() => handleSelect(img.url)}
						class={cn(
							'relative overflow-hidden',
							selected === img.url
								? 'absolute inset-0 z-50 m-auto flex h-1/2 w-full cursor-pointer flex-col flex-wrap items-center justify-center rounded-lg md:w-1/2'
								: lastSelected === img.url
									? 'z-40 h-full w-full rounded-xl bg-white'
									: 'h-full w-full rounded-xl bg-white'
						)}
					>
						{#if selected === img.url}
							<div
								class="relative z-[60] flex h-full w-full flex-col justify-end rounded-lg bg-transparent shadow-2xl"
							>
								<Motion
									let:motion
									initial={{
										opacity: 0
									}}
									animate={{
										opacity: 0.6
									}}
								>
									<div use:motion class="absolute inset-0 z-10 h-full w-full rounded-lg"></div>
								</Motion>
								<Motion
									let:motion
									initial={{
										opacity: 0,
										y: 100
									}}
									animate={{
										opacity: 1,
										y: 0
									}}
									transition={{
										duration: 0.3,
										ease: 'easeInOut'
									}}
								>
									<div
										use:motion
										class="relative z-[70] h-[70vh] overflow-hidden rounded-lg px-8 pb-4"
									>
										<img
											src={img.url}
											class={cn(
												'absolute inset-x-1 inset-y-0 bottom-1 h-full w-full rounded-lg object-contain transition duration-200'
											)}
											alt={img.altText}
										/>
									</div>
								</Motion>
							</div>
						{/if}
						<img
							src={img.url}
							class="h-80 w-full cursor-pointer rounded-lg object-cover object-left-top transition duration-300 group-hover:brightness-90"
							height="400"
							width="400"
							alt={img.altText}
						/>
					</div>
				</Motion>
			</div>
		{/each}
		<Motion let:motion animate={{ opacity: selected ? 0.5 : 0 }}>
			<div
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					if (e.key === 'Escape' || e.key === ' ') {
						handleClickOutside();
					}
				}}
				use:motion
				onclick={handleClickOutside}
				class={cn(
					'absolute left-0 top-0 z-10 h-full w-full bg-black opacity-90',
					selected ? 'pointer-events-auto' : 'pointer-events-none'
				)}
			></div>
		</Motion>
	</div>
</div>
