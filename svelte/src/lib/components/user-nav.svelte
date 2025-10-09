<script lang="ts">
	import { auth } from '$lib/auth/stores';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { type BAUser } from '$lib/types/models';
	import { cn } from '$lib/utils';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from './ui/dropdown-menu';

	const { user, className }: { user: BAUser; className?: string } = $props();
</script>

<DropdownMenu>
	<DropdownMenuTrigger class={cn('cursor-pointer', className)}>
		<Avatar class="ml-auto">
			<AvatarImage src={user.image} alt={user.name} referrerpolicy="no-referrer" />
			<AvatarFallback>{user.name}</AvatarFallback>
		</Avatar>
	</DropdownMenuTrigger>
	<DropdownMenuContent class="mr-5">
		<DropdownMenuItem onclick={() => auth.signOut()}>Sign out</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
