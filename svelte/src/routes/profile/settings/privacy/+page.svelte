<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import { auth } from '$lib/auth/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { Switch } from '$lib/components/ui/switch';
	import type { BAUser } from '$lib/types/user/index.js';
	import { Eye, EyeOff, Trash2 } from '@lucide/svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';

	interface Props {
		data: {
			user: BAUser;
		};
	}

	let { data }: Props = $props();
	const { user } = data;

	let isProfilePublic = $state(user.isProfilePublic ?? true);
	let showDeleteConfirm = $state(false);

	const updatePrivacy = createMutation({
		mutationFn: (isPublic: boolean) => api.auth.updatePrivacy(isPublic),
		onSuccess: () => {
			toast.success('Privacy settings updated');
		},
		onError: () => {
			toast.error('Failed to update privacy settings');
			isProfilePublic = !isProfilePublic;
		}
	});

	const deleteAccount = createMutation({
		mutationFn: () => api.auth.deleteAccount(),
		onSuccess: () => {
			toast.success('Account deleted successfully');
			auth.signOut();
			// Redirect to home or logout
			goto('/');
		},
		onError: () => {
			toast.error('Failed to delete account');
		}
	});

	function handleTogglePrivacy() {
		isProfilePublic = !isProfilePublic;
		$updatePrivacy.mutate(isProfilePublic);
	}

	function handleDeleteAccount() {
		$deleteAccount.mutate();
		showDeleteConfirm = false;
	}
</script>

<div class="max-w-3xl">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="mb-2 text-2xl font-bold">Privacy Settings</h1>
			<p class="text-muted-foreground text-sm">Manage your profile visibility and account data</p>
		</div>
	</div>

	<Separator class="mb-6" />

	<div class="space-y-6">
		<div class="rounded-lg border border-gray-200 bg-white p-6">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<div class="mb-2 flex items-center gap-2">
						{#if isProfilePublic}
							<Eye class="h-5 w-5 text-gray-600" />
						{:else}
							<EyeOff class="h-5 w-5 text-gray-600" />
						{/if}
						<h3 class="text-lg font-semibold">Public Profile</h3>
					</div>
					<p class="mb-2 text-sm text-gray-600">
						{#if isProfilePublic}
							Your profile is visible to other users. They can see your reviews, favorites, and
							activity.
						{:else}
							Your profile is private. Other users cannot view your profile or activity.
						{/if}
					</p>
					<p class="text-xs text-gray-500">
						Note: Your reviews will still be visible on venue pages, but without linking to your
						profile.
					</p>
				</div>
				<Switch
					checked={isProfilePublic}
					onCheckedChange={handleTogglePrivacy}
					disabled={$updatePrivacy.isPending}
				/>
			</div>
		</div>

		<!-- Delete Account -->
		<div class="rounded-lg border border-red-200 bg-white p-6">
			<div class="mb-4 flex items-start gap-3">
				<Trash2 class="mt-0.5 h-5 w-5 text-red-600" />
				<div class="flex-1">
					<h3 class="mb-2 text-lg font-semibold text-red-900">Delete Account</h3>
					<p class="mb-4 text-sm text-gray-600">
						Permanently delete your account and all associated data. This action cannot be undone.
					</p>

					{#if !showDeleteConfirm}
						<Button variant="destructive" onclick={() => (showDeleteConfirm = true)}>
							Delete Account
						</Button>
					{:else}
						<div class="rounded-lg border border-red-200 bg-red-50 p-4">
							<p class="mb-3 text-sm font-semibold text-red-900">
								Are you sure you want to delete your account?
							</p>
							<p class="mb-4 text-sm text-gray-700">This will permanently delete:</p>
							<ul class="mb-4 list-inside list-disc space-y-1 text-sm text-gray-700">
								<li>Your profile and account information</li>
								<li>All your reviews and ratings</li>
								<li>Your saved favorite venues</li>
								<li>All account activity and history</li>
							</ul>
							<div class="flex gap-3">
								<Button
									variant="destructive"
									onclick={handleDeleteAccount}
									disabled={$deleteAccount.isPending}
								>
									{$deleteAccount.isPending ? 'Deleting...' : 'Yes, Delete My Account'}
								</Button>
								<Button
									variant="outline"
									onclick={() => (showDeleteConfirm = false)}
									disabled={$deleteAccount.isPending}
								>
									Cancel
								</Button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
