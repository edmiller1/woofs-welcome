<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import type { BAUser } from '$lib/types/models';

	interface Props {
		data: {
			user: BAUser;
		};
	}

	const { data }: Props = $props();

	const { user } = data;
</script>

<div class="max-w-full">
	<div class="mb-6">
		<h1 class="mb-2 text-2xl font-bold">Reviews</h1>
	</div>
	<Separator class="mb-6" />
</div>
