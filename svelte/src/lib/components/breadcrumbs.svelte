<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';

	interface Props {
		type: string;
		islandName: string;
		regionName?: string;
		placeName?: string;
	}

	let { type, islandName, regionName, placeName }: Props = $props();

	const islandSlug = islandName.split(' ').join('-').toLowerCase();
	const regionSlug = regionName?.split(' ').join('-').toLowerCase();
</script>

<nav class="mt-4 flex">
	<Breadcrumb.Root>
		<Breadcrumb.List class="text-foreground">
			<Breadcrumb.Item class="hover:underline">
				<Breadcrumb.Link href="/">Home</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			{#if type === 'island'}
				<Breadcrumb.Item>{islandName}</Breadcrumb.Item>
			{:else if type === 'region'}
				<Breadcrumb.Item class="hover:underline">
					<Breadcrumb.Link href={`/island/${islandSlug}`}>{islandName}</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item>{regionName}</Breadcrumb.Item>
			{:else}
				<Breadcrumb.Item class="hover:underline">
					<Breadcrumb.Link href={`/island/${islandSlug}`}>{islandName}</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
				<Breadcrumb.Item class="hover:underline">
					<Breadcrumb.Link href={`/region/${regionSlug}`}>{regionName}</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Item>{placeName}</Breadcrumb.Item>
			{/if}
		</Breadcrumb.List>
	</Breadcrumb.Root>
</nav>
