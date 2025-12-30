<script lang="ts">
	import Footer from '$lib/components/footer.svelte';
	import HomeNavbar from '$lib/components/home-navbar.svelte';
	import Features from './components/features.svelte';
	import Hero from './components/hero.svelte';
	import Pricing from './components/pricing.svelte';

	let { data } = $props();
	let { user } = $derived(data);
</script>

<svelte:head>
	<title>Business Accounts | Woofs Welcome</title>
	<meta
		name="description"
		content="Reach dog owners across New Zealand. Claim your dog-friendly business and get priority placement in search results."
	/>
</svelte:head>

<HomeNavbar {user} />
<Hero />
<Features />
<Pricing />
<Footer />
