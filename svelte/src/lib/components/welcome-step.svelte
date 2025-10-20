<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { ImagePlus, LoaderCircle, X } from '@lucide/svelte';
	import { useValidation } from '$lib/hooks/use-validation.svelte';
	import { profileUpdateSchema } from '$lib/validation/schemas';
	import ValidationError from '$lib/components/validation-error.svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { api } from '$lib/api';
	import { handleMutationSuccess } from '$lib/hooks/use-query-error';
	import { getErrorMessage } from '$lib/errors';
	import { toast } from 'svelte-sonner';
	import { getFileBase64, getUserInitials } from '$lib/helpers';
	import { auth } from '$lib/auth/stores';
	import confetti from 'canvas-confetti';

	interface Props {
		onComplete: () => void;
		email: string;
	}

	let { onComplete, email }: Props = $props();

	let formData = $state({
		name: '',
		image: ''
	});

	let imagePreview = $state<{ url: string; base64Value: string } | null>(null);
	let fileInputRef: HTMLInputElement;

	const validation = useValidation(profileUpdateSchema);

	const updateProfile = createMutation({
		mutationFn: async (data: { name: string; image?: string }) => api.auth.welcome(data),
		onSuccess: async () => {
			handleMutationSuccess('Welcome! Your profile has been created.');
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6 }
			});
			// Refresh session to get updated user data
			await auth.initialize();
			onComplete();
		},
		onError: (error) => {
			toast.error(getErrorMessage(error));
		}
	});

	const handleImageSelect = async (e: Event) => {
		const target = e.target as HTMLInputElement;
		const file = target?.files?.[0];
		if (!file) return;

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error('Image must be less than 5MB');
			return;
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			toast.error('Please select an image file');
			return;
		}

		try {
			const base64String = await getFileBase64(file);
			const url = URL.createObjectURL(file);

			imagePreview = { url, base64Value: base64String };
			formData.image = base64String;
		} catch (error) {
			toast.error('Failed to process image');
		}
	};

	const handleRemoveImage = () => {
		imagePreview = null;
		formData.image = '';
		if (fileInputRef) {
			fileInputRef.value = '';
		}
	};

	const handleSubmit = async () => {
		if (!validation.validate(formData)) {
			return;
		}

		$updateProfile.mutate(formData);
	};
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="text-center">
		<h2 class="text-2xl font-bold">Welcome to Woofs Welcome! 🐕</h2>
		<p class="text-muted-foreground mt-2">Let's set up your profile</p>
	</div>

	<!-- Avatar Upload -->
	<div class="flex flex-col items-center gap-4">
		<div class="relative">
			<Avatar class="h-24 w-24">
				{#if imagePreview}
					<AvatarImage src={imagePreview.url} alt="Profile preview" />
				{:else}
					<AvatarFallback class="text-2xl">
						{getUserInitials(formData.name || email)}
					</AvatarFallback>
				{/if}
			</Avatar>

			{#if imagePreview}
				<button
					type="button"
					onclick={handleRemoveImage}
					class="bg-destructive hover:bg-destructive/90 absolute -right-2 -top-2 rounded-full p-1 shadow-md"
				>
					<X class="h-4 w-4 text-white" />
				</button>
			{/if}
		</div>

		<Button
			type="button"
			variant="outline"
			size="sm"
			onclick={() => fileInputRef.click()}
			class="gap-2"
		>
			<ImagePlus class="h-4 w-4" />
			{imagePreview ? 'Change Photo' : 'Add Photo'}
		</Button>

		<input
			bind:this={fileInputRef}
			type="file"
			accept="image/*"
			onchange={handleImageSelect}
			class="hidden"
		/>
	</div>

	<!-- Name Input -->
	<div class="space-y-2">
		<Label for="name">
			Your Name <span class="text-red-500">*</span>
		</Label>
		<Input
			id="name"
			bind:value={formData.name}
			placeholder="Enter your name"
			disabled={$updateProfile.isPending}
			class={validation.errors.name ? 'border-red-500' : ''}
			autofocus
		/>
		<ValidationError errors={validation.errors} field="name" />
	</div>

	<!-- Action Buttons -->
	<div class="flex gap-3">
		<Button
			type="button"
			onclick={handleSubmit}
			disabled={$updateProfile.isPending || !formData.name}
			class="flex-1"
		>
			{#if $updateProfile.isPending}
				<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
				Saving...
			{:else}
				Complete Profile
			{/if}
		</Button>
	</div>

	<!-- Privacy Note -->
	<p class="text-muted-foreground text-center text-xs">
		Your name will be visible when you leave reviews and interact with the community.
	</p>
</div>
