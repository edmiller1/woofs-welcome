<script lang="ts">
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import type { BAUser } from '$lib/types/user';
	import DashboardCards from '../components/dashboard-cards.svelte';

	interface Props {
		data: {
			user: BAUser;
		};
	}

	let { data }: Props = $props();

	const { user } = data;

	const business = $derived(user.business);
</script>

<div class="max-w-full">
	<div class="mb-6">
		<h1 class="mb-2 text-2xl font-bold">Dashboard</h1>
		<Separator class="mb-6" />
		<div class="flex flex-1 flex-col">
			<div class="@container/main flex flex-1 flex-col gap-2">
				<div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
					<DashboardCards />
				</div>
			</div>
		</div>
	</div>
</div>
