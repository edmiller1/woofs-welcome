<script lang="ts">
	import { api } from '$lib/api';
	import Navbar from '$lib/components/navbar.svelte';
	import type { BAUser } from '$lib/types/models';

	interface Props {
		data: {
			user: BAUser;
		};
	}

	let { data }: Props = $props();

	const { user } = data;
</script>

<div class="max-w-3xl">
	<div class="mb-6">
		<h1 class="mb-2 text-2xl font-bold">Profile</h1>
	</div>
</div>
