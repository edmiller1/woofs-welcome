<script lang="ts">
	import { goto } from '$app/navigation';
	import GoogleLogo from '$lib/components/google-logo.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Loader2 } from '@lucide/svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { toast } from 'svelte-sonner';

	let { supabase }: { supabase: SupabaseClient } = $props();

	let email: string = $state('');
	let loading: boolean = $state(false);

	const handleGoogleLogin = async () => {
		try {
			console.log('logging in with google');
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/auth/callback`,
					queryParams: {
						access_type: 'offline',
						prompt: 'consent'
					}
				}
			});

			if (error) {
				throw error;
			} else {
				goto('/welcome');
			}
		} catch (error) {
			console.error('Error during Google login:', error);
			toast.error('Failed to sign in with Google. Please try again.');
		}
	};

	const handleEmailSignIn = async (e: SubmitEvent) => {
		e.preventDefault();
		try {
			loading = true;

			const { error } = await supabase.auth.signInWithOtp({
				email: email.trim(),
				options: {
					shouldCreateUser: true
				}
			});

			if (error) {
				loading = false;
				throw error;
			} else {
				toast.success(
					`Success! Please check your email: ${email.trim()} for a one time password code.`,
					{
						duration: 10000
					}
				);
				setTimeout(() => {
					const promise = () =>
						new Promise((resolve) => setTimeout(() => resolve({ name: 'Sonner' }), 2000));
					goto(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
					toast.promise(promise, {
						loading: 'Loading...',
						success: () => {
							return 'Redirecting to verification page...';
						},
						error: 'Failed to redirect to verification page.'
					});
				}, 3000);
			}
		} catch (error) {
			console.error('Error during email sign-in:', error);
			toast.error('Failed to sign in with email. Please try again.');
		} finally {
			loading = false;
		}
	};
</script>

<Card class="w-[400px]">
	<CardContent>
		<form onsubmit={(e) => handleEmailSignIn(e)} class="flex flex-col gap-6">
			<div class="flex flex-col items-center gap-2 text-center">
				<h1 class="text-2xl font-bold">Sign in to your account</h1>
				<p class="text-muted-foreground text-balance text-sm">
					Enter your email below to sign in to your account
				</p>
			</div>
			<div class="grid gap-6">
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="name@example.com"
						bind:value={email}
						required
					/>
				</div>
				<Button type="submit" class="w-full" disabled={loading}>
					{#if loading}
						<Loader2 class="size-3 animate-spin" stroke-width={3} />
						Signing in...
					{:else}
						Sign in
					{/if}
				</Button>
			</div>
		</form>
		<div class="space-y-4">
			<div
				class="after:border-border relative mt-3 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"
			>
				<span class="bg-card text-muted-foreground relative z-10 px-2"> Or continue with </span>
			</div>
			<Button variant="outline" class="w-full" onclick={handleGoogleLogin} disabled={loading}>
				<GoogleLogo />
				Sign in with Google
			</Button>
			<div class="text-center text-sm">
				Don't have an account?
				<a href="/sign-up" class="underline-offset-4 hover:underline"> Sign up </a>
			</div>
		</div>
	</CardContent>
</Card>
