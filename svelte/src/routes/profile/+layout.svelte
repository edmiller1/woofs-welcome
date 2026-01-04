<script lang="ts">
	import Navbar from '$lib/components/navbar.svelte';
	import type { Snippet } from 'svelte';
	import Sidebar from './components/sidebar.svelte';
	import type { BAUser } from '$lib/types/user';

	interface Props {
		data: {
			user: BAUser;
		};
		children: Snippet;
	}

	let { data, children }: Props = $props();
	let { user } = data;
</script>

<div class="flex h-screen flex-col overflow-hidden bg-white">
	<Navbar {user} />
	<div class="flex flex-1 overflow-hidden">
		<Sidebar {user} />
		<main class="flex-1 overflow-y-auto p-8 md:p-12 lg:p-16">
			{@render children()}
		</main>
	</div>
</div>
