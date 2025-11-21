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
	<title>Business</title>
	<meta name="description" content="Create or claim your dog-friendly business." />
</svelte:head>

<HomeNavbar {user} />
<Hero />
<Features />
<Pricing />
<Footer />
