<script lang="ts">
	import { type User } from '@supabase/supabase-js';
	import { AlignJustify, CircleUser, GalleryHorizontalEnd } from '@lucide/svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { Button } from './ui/button';

	interface Props {
		user: User | null;
	}

	let { user }: Props = $props();
</script>

<header class="flex h-20 w-full shrink-0 items-center justify-between px-4 md:px-12">
	<a href="/" class="flex items-center gap-2">
		<GalleryHorizontalEnd class="text-primary h-8 w-8" />
		<span class="text-xl font-bold">Woofs Welcome</span>
	</a>

	{#if user}
		<Button variant="ghost" class="rounded-full px-1 py-3">
			<CircleUser class="size-6" />
			<span class="sr-only">User Menu</span>
		</Button>
	{:else}
		<div class="flex items-center gap-2">
			<a href="/business">
				<Button variant="ghost">Create a business account</Button>
			</a>
			<DropdownMenu>
				<DropdownMenuTrigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost">
							<AlignJustify class="size-6" />
							<span class="sr-only">Menu</span>
						</Button>
					{/snippet}
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<a href="/sign-in">
						<DropdownMenuItem>Sign in</DropdownMenuItem>
					</a>
					<a href="/sign-up">
						<DropdownMenuItem>Sign up</DropdownMenuItem>
					</a>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	{/if}
</header>
