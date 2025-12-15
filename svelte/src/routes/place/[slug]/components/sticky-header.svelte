<script lang="ts">
	import { page } from '$app/state';
	import SaveButton from '$lib/components/save-button.svelte';
	import ShareButton from '$lib/components/share-button.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { classNames } from '$lib/helpers';
	import type { BAUser, Claim, Tab } from '$lib/types/models';
	import { BadgeCheck } from '@lucide/svelte';

	interface Props {
		placeName: string;
		placeClaim: Claim | null;
		placeId: string;
		user: BAUser | null;
		openAuthModal: () => void;
		changeTab: (tab: string) => void;
		tabs: Tab[];
		currentTab: string;
		isFavourited: boolean;
		headerElement: HTMLElement | undefined;
		scrollY: number;
		showStickyHeader: boolean;
	}

	let {
		placeName,
		placeId,
		placeClaim,
		user,
		openAuthModal,
		changeTab,
		tabs,
		currentTab,
		isFavourited,
		headerElement,
		scrollY,
		showStickyHeader
	}: Props = $props();

	$effect(() => {
		if (headerElement && scrollY > 0) {
			const headerBottom = headerElement.offsetTop + headerElement.offsetHeight;
			showStickyHeader = scrollY > headerBottom;
		}
	});
</script>

<svelte:window bind:scrollY />

{#if showStickyHeader}
	<div
		class="sticky top-0 z-[99] w-full border-b border-gray-200 bg-white shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/95"
	>
		<div class="mx-auto max-w-7xl px-2 pt-3 sm:px-4 lg:px-8">
			<!-- Place name and buttons -->
			<div class="mb-3 flex items-center justify-between">
				<div class="flex items-center gap-4">
					<h2 class="text-xl font-bold sm:text-2xl">
						{placeName}
					</h2>
					{#if placeClaim}
						<BadgeCheck
							class="hidden size-6 text-white sm:inline-block"
							fill="oklch(0.63 0.17 149)"
						/>
					{/if}
				</div>
				<div class="flex items-center gap-3">
					<ShareButton link={page.url.href} name={placeName} />
					{#if !placeClaim}
						<Button
							size="sm"
							class="rounded-full"
							onclick={user
								? () => {
										console.log('Claiming place');
									}
								: openAuthModal}
						>
							Claim <BadgeCheck class="size-3" />
						</Button>
					{/if}
					<SaveButton {user} {openAuthModal} {placeId} {isFavourited} />
				</div>
			</div>
			<Separator />
			<!-- Sticky Tabs -->
			<div class="hidden sm:block">
				<nav aria-label="Tabs" class="flex space-x-8 font-semibold">
					{#each tabs as tab}
						<a
							href={tab.href}
							aria-current={currentTab ? 'page' : undefined}
							class={classNames(
								currentTab === tab.name
									? 'border-primary text-primary '
									: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
								'whitespace-nowrap border-b-2 px-1 py-2 text-sm'
							)}
							onclick={() => changeTab(tab.name)}
						>
							{tab.name}
						</a>
					{/each}
				</nav>
			</div>
		</div>
	</div>
{/if}
