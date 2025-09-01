<script lang="ts">
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { authModal, authModalActions } from '$lib/auth/auth-modal-store';
	import { auth } from '$lib/auth/stores';
	import { toast } from 'svelte-sonner';
	import GoogleLogo from './google-logo.svelte';
	import DialogDescription from './ui/dialog/dialog-description.svelte';
	import { Loader2 } from '@lucide/svelte';
	import { api } from '$lib/api';

	let email = $state<string>('');
	let otp = $state<string>('');
	let step = $state<'email' | 'otp'>('email');
	let loading = $state<boolean>(false);
	let googleLoading = $state<boolean>(false);

	const isOpen = $derived($authModal.isOpen);
	const mode = $derived($authModal.mode);

	const handleEmailSubmit = async () => {
		if (!email) return;

		loading = true;
		try {
			if (mode === 'sign-in') {
				const emailCheck = await api.auth.checkEmails(email.trim());

				if (!emailCheck) {
					// Automatically switch to sign-up mode
					authModalActions.switchMode('sign-up');
					toast.info("No account found. We've switched you to sign-up mode.");
					return;
				}
			}
			//send OTP
			const result =
				mode === 'sign-in' ? await auth.signIn(email.trim()) : await auth.signUp(email.trim());

			if (result.error) {
				toast.error(result.error.message || 'Failed to send verification code');
				return;
			} else {
				step = 'otp';
				toast.success('Verification code sent to your email!');
			}
		} catch (error) {
			console.error('Email sign-in error:', error);
			toast.error('Failed to send verification code');
		} finally {
			loading = false;
		}
	};

	const handleOtpSubmit = async () => {
		if (!otp) return;

		loading = true;
		try {
			const result = await auth.verifyOtp(email.trim(), otp);

			if (result.error) {
				toast.error(result.error.message || 'Failed to verify code');
				return;
			} else {
				toast.success('Welcome!');
				await authModalActions.handleSuccess();
			}
		} catch (error) {
			console.error('OTP verification error:', error);
			toast.error('Invalid code');
		} finally {
			loading = false;
		}
	};

	const handleGoogleLogin = async () => {
		googleLoading = true;
		try {
			await auth.oAuthSignIn('google');
		} catch (error) {
			console.error('Google login error:', error);
			toast.error('Failed to sign in with Google');
		}
	};

	const handleClose = () => {
		authModalActions.close();
		email = '';
		otp = '';
		step = 'email';
		loading = false;
	};

	const switchMode = () => {
		const newMode = mode === 'sign-in' ? 'sign-up' : 'sign-in';
		authModalActions.switchMode(newMode);
		step = 'email';
	};
</script>

<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
	<DialogContent class="z-[99] sm:max-w-md">
		<DialogHeader>
			<DialogTitle>
				{mode === 'sign-in' ? 'Sign in to your account' : 'Create Account'}
			</DialogTitle>
			<DialogDescription
				>{mode === 'sign-in'
					? 'Enter your email below to sign in to your account'
					: 'Enter your email below to create an account'}</DialogDescription
			>
		</DialogHeader>

		<div class="space-y-4">
			{#if step === 'email'}
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="Enter your email"
						bind:value={email}
						disabled={loading}
					/>
				</div>

				<Button class="w-full" onclick={handleEmailSubmit} disabled={loading || !email}>
					{loading ? 'Sending...' : mode === 'sign-in' ? 'Sign In' : 'Create Account'}
				</Button>

				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<span class="w-full border-t"></span>
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span class="bg-background text-muted-foreground px-2">Or</span>
					</div>
				</div>

				<Button variant="outline" class="w-full" onclick={handleGoogleLogin}>
					{#if googleLoading}
						<Loader2 class="size-4 animate-spin" stroke-width={3} />
						Connecting to Google...
					{:else}
						<GoogleLogo />
						Sign in with Google
					{/if}
				</Button>

				<div class="text-center text-sm">
					{mode === 'sign-in' ? "Don't have an account?" : 'Already have an account?'}
					<Button variant="link" class="h-auto p-0" onclick={switchMode}>
						{mode === 'sign-in' ? 'Sign up' : 'Sign in'}
					</Button>
				</div>
			{:else}
				<div class="space-y-2">
					<Label for="otp">Verification Code</Label>
					<Input
						id="otp"
						placeholder="Enter 6-digit code"
						bind:value={otp}
						disabled={loading}
						maxlength={6}
					/>
					<p class="text-muted-foreground text-sm">
						We sent a code to {email}
					</p>
				</div>

				<Button class="w-full" onclick={handleOtpSubmit} disabled={loading || otp.length !== 6}>
					{loading ? 'Verifying...' : 'Verify Code'}
				</Button>

				<Button variant="outline" class="w-full" onclick={() => (step = 'email')}>
					Back to Email
				</Button>
			{/if}
		</div>
	</DialogContent>
</Dialog>
