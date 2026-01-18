<script lang="ts">
	import Navbar from '$lib/components/navbar.svelte';
	import type { Snippet } from 'svelte';
	import type { BAUser } from '$lib/types/user';
	import AdminSidebar from './components/admin-sidebar.svelte';

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
		<AdminSidebar {user} />
		<main class="flex-1 overflow-y-auto bg-slate-50 p-8 md:p-12 lg:p-16">
			{@render children()}
		</main>
	</div>
</div>
