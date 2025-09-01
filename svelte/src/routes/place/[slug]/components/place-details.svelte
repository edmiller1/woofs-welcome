<script lang="ts">
	import { Globe, Mail, MapPin, Phone } from '@lucide/svelte';

	interface Props {
		address: string;
		website?: string;
		email: string | null;
		phone?: string;
	}

	const { address, website, email, phone }: Props = $props();
</script>

<h3 class="text-2xl font-semibold">About</h3>
<div class="space-y-2 pt-2">
	<div class="text-muted-foreground flex items-center gap-1 text-sm">
		<MapPin class="size-4 flex-shrink-0" />
		<p>{address}</p>
	</div>
	<div class="flex flex-wrap items-center gap-4 text-sm">
		{#if website}
			<a
				href={website}
				target="_blank"
				class="text-muted-foreground hover:text-foreground flex items-center gap-1 underline transition-colors"
			>
				<Globe class="size-4" />
				Website
			</a>
		{/if}

		{#if email}
			<a
				href={`mailto:${email}`}
				class="text-muted-foreground hover:text-foreground flex items-center gap-1 underline transition-colors"
			>
				<Mail class="size-4" />
				Email
			</a>
		{/if}

		{#if phone}
			<a
				href={`tel:${phone}`}
				class="text-muted-foreground hover:text-foreground flex items-center gap-1 underline transition-colors"
			>
				<Phone class="size-4" />
				{phone}
			</a>
		{/if}
	</div>
</div>
