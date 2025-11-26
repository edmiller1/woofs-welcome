<script lang="ts">
	import { formatDate, getFileBase64 } from '$lib/helpers';
	import { Button } from '$lib/components/ui/button';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import type { BAUser, ErrorResponse } from '$lib/types/models';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import type { AxiosError } from 'axios';
	import { ImagePlus, LoaderCircle, X } from '@lucide/svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { api } from '$lib/api';
	import { auth } from '$lib/auth/stores';

	interface Props {
		data: {
			user: BAUser;
		};
	}

	const { data }: Props = $props();

	const { user } = data;

	// State for dialogs
	let nameDialogOpen = $state(false);
	let avatarDialogOpen = $state(false);

	// Form state
	let newName = $state(user.name);
	let avatarPreview = $state<{ url: string; base64: string } | null>(null);

	//Update name mutation
	const updateName = createMutation({
		mutationFn: async (name: string) => api.auth.updateProfile({ name }),
		onSuccess: () => {
			toast.success('Name updated successfully!');
			nameDialogOpen = false;
			window.location.reload();
		},
		onError: (error: AxiosError<ErrorResponse>) => {
			if (error.response?.data.error) {
				toast.error(error.response.data.error);
			} else {
				toast.error('Failed to update name');
			}
		}
	});

	// Update avatar mutation
	const updateAvatar = createMutation({
		mutationFn: async (image: string) => api.auth.updateProfile({ image }),
		onSuccess: () => {
			toast.success('Avatar updated successfully!');
			avatarDialogOpen = false;
			avatarPreview = null;
			window.location.reload();
		},
		onError: (error: AxiosError<ErrorResponse>) => {
			if (error.response?.data.error) {
				toast.error(error.response.data.error);
			} else {
				toast.error('Failed to update avatar');
			}
		}
	});

	const handleNameSubmit = () => {
		if (!newName || newName.trim().length < 2) {
			toast.error('Name must be at least 2 characters');
			return;
		}
		$updateName.mutate(newName.trim());
	};

	const handleImageSelect = async (e: Event) => {
		const target = e.target as HTMLInputElement;
		const file = target?.files?.[0];
		if (!file) return;

		// Validate file size (5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error('Image must be less than 5MB');
			return;
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			toast.error('File must be an image');
			return;
		}

		const base64 = await getFileBase64(file);
		const url = URL.createObjectURL(file);
		avatarPreview = { url, base64 };
	};

	const handleAvatarSubmit = () => {
		if (!avatarPreview) {
			toast.error('Please select an image');
			return;
		}
		$updateAvatar.mutate(avatarPreview.base64);
	};

	const removeAvatarPreview = () => {
		if (avatarPreview?.url) {
			URL.revokeObjectURL(avatarPreview.url);
		}
		avatarPreview = null;
	};

	const handleNameDialogChange = (open: boolean) => {
		// Don't allow closing if mutation is in progress
		if (!open && $updateName.isPending) {
			return;
		}
		nameDialogOpen = open;
	};

	const handleAvatarDialogChange = (open: boolean) => {
		// Don't allow closing if mutation is in progress
		if (!open && $updateAvatar.isPending) {
			return;
		}
		avatarDialogOpen = open;
	};
</script>

<div class="max-w-3xl">
	<h1 class="mb-2 text-2xl font-bold">Account Settings</h1>

	<Separator class="mb-6" />

	<div class="mb-8">
		<div class="mb-6">
			<div class="space-y-4">
				<div class="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
					<div class="max-w-2xl space-y-1">
						<Avatar.Root class="size-20">
							<Avatar.Image src={user.image} alt={user.name} class="object-cover object-center" />
							<Avatar.Fallback>{user.name[0].toUpperCase()}</Avatar.Fallback>
						</Avatar.Root>
						<div class="space-y-1">
							<h4 class="text-sm font-medium">Profile Picture</h4>
						</div>
					</div>
					<Button variant="outline" onclick={() => (avatarDialogOpen = true)}>Change Image</Button>
				</div>
				<div class="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
					<div class="max-w-2xl space-y-1">
						<h4 class="text-sm font-medium">{user.name}</h4>
					</div>
					<Button variant="outline" onclick={() => (nameDialogOpen = true)}>Change Name</Button>
				</div>
				<div class="flex items-start justify-between border-b border-gray-100 pb-4 last:border-0">
					<div class="max-w-2xl space-y-1">
						<h4 class="text-sm font-medium">{user.email}</h4>
					</div>
				</div>
				<div class="flex items-start justify-between border-b border-gray-100 pb-4 last:border-0">
					<div class="max-w-2xl space-y-1">
						<h4 class="text-sm font-medium">
							Joined on {formatDate(user.createdAt.toISOString())}
						</h4>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Change Name Dialog -->
<Dialog.Root bind:open={nameDialogOpen} onOpenChange={handleNameDialogChange}>
	<Dialog.Content
		onInteractOutside={(e) => {
			if ($updateName.isPending) {
				e.preventDefault();
			}
		}}
	>
		<Dialog.Header>
			<Dialog.Title>Change Name</Dialog.Title>
			<Dialog.Description>
				Update your display name. This will be visible to other users.
			</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="name">Name</Label>
				<Input
					id="name"
					bind:value={newName}
					placeholder="Enter your name"
					disabled={$updateName.isPending}
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => (nameDialogOpen = false)}
				disabled={$updateName.isPending}>Cancel</Button
			>
			<Button onclick={handleNameSubmit} disabled={$updateName.isPending}>
				{#if $updateName.isPending}
					<LoaderCircle class="mr-2 size-4 animate-spin" />
				{/if}
				Save Changes
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Change Avatar Dialog -->
<Dialog.Root bind:open={avatarDialogOpen} onOpenChange={handleAvatarDialogChange}>
	<Dialog.Content
		onInteractOutside={(e) => {
			if ($updateAvatar.isPending) {
				e.preventDefault();
			}
		}}
	>
		<Dialog.Header>
			<Dialog.Title>Change Profile Picture</Dialog.Title>
			<Dialog.Description>
				Upload a new profile picture. JPG, PNG or GIF. Max size 5MB.
			</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4 py-4">
			{#if avatarPreview}
				<div class="relative mx-auto w-fit">
					<img
						src={avatarPreview.url}
						alt="Preview"
						class="size-32 rounded-full object-cover object-center"
					/>
					<button
						onclick={removeAvatarPreview}
						class="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
						type="button"
					>
						<X class="size-4" />
					</button>
				</div>
			{:else}
				<div
					class="bg-muted flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8"
				>
					<ImagePlus class="text-muted-foreground mb-4 size-12" />
					<Label
						for="avatar-upload"
						class="text-primary cursor-pointer font-medium hover:underline"
					>
						Click to upload
					</Label>
					<Input
						id="avatar-upload"
						type="file"
						accept="image/*"
						class="sr-only"
						onchange={handleImageSelect}
					/>
					<p class="text-muted-foreground mt-2 text-xs">PNG, JPG or GIF (max. 5MB)</p>
				</div>
			{/if}
		</div>
		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => (avatarDialogOpen = false)}
				disabled={$updateName.isPending}>Cancel</Button
			>
			<Button onclick={handleAvatarSubmit} disabled={$updateAvatar.isPending || !avatarPreview}>
				{#if $updateAvatar.isPending}
					<LoaderCircle class="mr-2 size-4 animate-spin" />
				{/if}
				Upload
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
