<script lang="ts">
	import { Button } from './ui/button';
</script>

<div class="flex h-52 w-full flex-col items-center justify-center gap-10 border-t">
	<div class="flex items-center text-center text-lg">
		<Button variant="link" class="text-foreground">About</Button>
		<Button variant="link" class="text-foreground">Mobile App</Button>
		<Button variant="link" class="text-foreground">Blog</Button>
		<Button variant="link" class="text-foreground">Contact</Button>
	</div>
	<div class="text-muted-foreground text-sm">
		&copy; {new Date().getFullYear()} Woofs Welcome. All rights reserved.
	</div>
</div>
