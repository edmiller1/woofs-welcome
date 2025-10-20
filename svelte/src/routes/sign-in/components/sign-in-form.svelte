<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth/stores';
	import GoogleLogo from '$lib/components/google-logo.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { LoaderCircle } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let email = $state<string>('');
	let loading = $state<boolean>(false);
	let googleLoading = $state<boolean>(false);

	const handleGoogleLogin = async () => {
		console.log('Google login initiated');
		try {
			googleLoading = true;
			await auth.oAuthSignIn('google');
		} catch (error) {
			console.error('Google login error:', error);
			toast.error('Failed to sign in with Google');
			googleLoading = false;
		}
	};

	const handleEmailSignIn = async (e: SubmitEvent) => {
		e.preventDefault();

		try {
			loading = true;

			//Send OTP
			const result = await auth.signIn(email.trim());

			if (result.error) {
				toast.error(result.error.message || 'Failed to send verification code');
				return;
			}

			// Success - redirect to verification page
			toast.success('Verification code sent to your email!');
			goto(`/verify-otp?email=${encodeURIComponent(email)}&type=sign-in`);
		} catch (error) {
			console.error('Email sign-in error:', error);
			toast.error('Failed to send verification code');
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
				<Button type="submit" class="w-full" disabled={loading || googleLoading}>
					{#if loading}
						<LoaderCircle class="size-3 animate-spin" stroke-width={3} />
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
			<Button
				variant="outline"
				class="w-full"
				onclick={handleGoogleLogin}
				disabled={loading || googleLoading}
			>
				{#if googleLoading}
					<LoaderCircle class="size-3 animate-spin" stroke-width={3} />
					Connecting to Google...
				{:else}
					<GoogleLogo />
					Sign in with Google
				{/if}
			</Button>
			<div class="text-center text-sm">
				Don't have an account?
				<a href="/sign-up" class="underline-offset-4 hover:underline"> Sign up </a>
			</div>
		</div>
	</CardContent>
</Card>
