<script lang="ts">
	import { Copy, Mail, Share } from '@lucide/svelte';
	import { Button } from './ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { toast } from 'svelte-sonner';

	interface Props {
		link: string;
		name: string;
	}

	const { link, name }: Props = $props();

	const copyToClipboard = () => {
		navigator.clipboard.writeText(link);
		toast.success('Link copied to clipboard');
	};

	const shareViaEmail = () => {
		const subject = encodeURIComponent(`Check out ${name} on Woofs Welcome`);
		const body = encodeURIComponent(`Check out ${name} on Woofs Welcome: ${link}`);

		window.location.href = `mailto:?subject=${subject}&body=${body}`;
	};
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button variant="ghost" size="sm" class="underline">
			Share <Share class="size-3" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="z-[999] mr-20">
		<DropdownMenu.Group>
			<DropdownMenu.Item onclick={shareViaEmail}><Mail />Email</DropdownMenu.Item>
			<DropdownMenu.Item onclick={copyToClipboard}><Copy /> Copy Link</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
