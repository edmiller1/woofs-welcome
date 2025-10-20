<script lang="ts">
	import {
		SITE_CONFIG,
		generateTitle,
		truncateDescription,
		getAbsoluteUrl,
		type PageMetadata
	} from '$lib/seo/metadata';

	interface Props {
		metadata: PageMetadata;
		structuredData?: Record<string, any> | Record<string, any>[];
	}

	let { metadata, structuredData }: Props = $props();

	// Derive computed values
	const title = $derived(generateTitle(metadata.title));
	const description = $derived(truncateDescription(metadata.description));
	const image = $derived(metadata.image || SITE_CONFIG.image);
	const url = $derived(metadata.url || getAbsoluteUrl(window.location.pathname));
	const canonical = $derived(metadata.canonical || url);
	const type = $derived(metadata.type || 'website');
	const locale = $derived(metadata.locale || SITE_CONFIG.locale);

	// Generate keywords
	const keywords = $derived(
		metadata.keywords ? metadata.keywords.join(', ') : 'dog friendly, pet friendly, dogs welcome'
	);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{title}</title>
	<meta name="title" content={title} />
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />

	<!-- Canonical URL -->
	<link rel="canonical" href={canonical} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content={locale} />
	<meta property="og:site_name" content={SITE_CONFIG.name} />

	{#if metadata.publishedTime}
		<meta property="article:published_time" content={metadata.publishedTime} />
	{/if}

	{#if metadata.modifiedTime}
		<meta property="article:modified_time" content={metadata.modifiedTime} />
	{/if}

	{#if metadata.author}
		<meta property="article:author" content={metadata.author} />
	{/if}

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={url} />
	<meta property="twitter:title" content={title} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content={image} />
	<meta property="twitter:site" content={SITE_CONFIG.twitterHandle} />

	<!-- Additional Meta Tags -->
	<meta name="robots" content="index, follow" />
	<meta name="language" content="English" />
	<meta name="revisit-after" content="7 days" />
	<meta name="author" content={SITE_CONFIG.name} />

	<!-- Structured Data / JSON-LD -->
	{#if structuredData}
		{#if Array.isArray(structuredData)}
			{#each structuredData as schema}
				{@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
			{/each}
		{:else}
			{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
		{/if}
	{/if}
</svelte:head>
