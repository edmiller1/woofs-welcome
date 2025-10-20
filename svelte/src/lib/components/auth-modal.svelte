<script lang="ts">
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { authModal, authModalActions } from '$lib/auth/auth-modal-store';
	import { auth, needsProfileCompletion } from '$lib/auth/stores';
	import { toast } from 'svelte-sonner';
	import GoogleLogo from './google-logo.svelte';
	import DialogDescription from './ui/dialog/dialog-description.svelte';
	import { Loader2, ArrowLeft } from '@lucide/svelte';
	import { api } from '$lib/api';
	import WelcomeStep from '$lib/components/welcome-step.svelte';
	import { useValidation } from '$lib/hooks/use-validation.svelte';
	import { emailSchema } from '$lib/validation/schemas';
	import ValidationError from './validation-error.svelte';
	import { cn } from '$lib/utils';

	let email = $state<string>('');
	let otp = $state<string>('');
	let loading = $state<boolean>(false);
	let googleLoading = $state<boolean>(false);

	const isOpen = $derived($authModal.isOpen);
	const mode = $derived($authModal.mode);
	const step = $derived($authModal.step);
	const storedEmail = $derived($authModal.email);

	const emailValidation = useValidation(emailSchema);

	const handleEmailSubmit = async () => {
		// Validate email
		if (!emailValidation.validate({ email: email.trim() })) {
			return;
		}

		loading = true;
		try {
			if (mode === 'sign-in') {
				const emailCheck = await api.auth.checkEmails(email.trim());

				if (!emailCheck) {
					authModalActions.switchMode('sign-up');
					toast.info("No account found. We've switched you to sign-up mode.");
					return;
				}
			}

			const result = await auth.signIn(email.trim());

			if (result.error) {
				toast.error(result.error.message || 'Failed to send verification code');
				return;
			} else {
				authModalActions.setStep('otp', email.trim());
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
		if (!otp || !storedEmail) return;

		loading = true;
		try {
			console.log('Verifying OTP:', {
				email: storedEmail,
				otp: otp,
				otpLength: otp.length
			});
			const result = await auth.verifyOtp(storedEmail, otp);

			console.log('OTP verification result:', result); // ✅ Log response

			if (result.error) {
				console.error('OTP error details:', result.error);
				toast.error(result.error.message || 'Failed to verify code');
				return;
			} else {
				// Check if user needs to complete profile
				// Wait a moment for the session to update
				await new Promise((resolve) => setTimeout(resolve, 100));

				if ($needsProfileCompletion) {
					authModalActions.setStep('welcome', storedEmail);
				} else {
					toast.success('Welcome back!');
					await authModalActions.handleSuccess();
				}
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
			googleLoading = false;
		}
	};

	const handleResendOTP = async () => {
		if (!storedEmail) return;

		try {
			const type = mode === 'sign-in' ? 'sign-in' : 'email-verification';
			const result = await auth.resendOTP(storedEmail, type);

			if (result.error) {
				toast.error(result.error.message || 'Failed to resend code');
			} else {
				toast.success('Verification code resent!');
			}
		} catch (error) {
			toast.error('Failed to resend code');
		}
	};

	const handleClose = () => {
		authModalActions.close();
		email = '';
		otp = '';
		loading = false;
		emailValidation.clearErrors();
	};

	const handleBack = () => {
		if (step === 'otp') {
			authModalActions.setStep('email');
			otp = '';
		}
	};

	const switchMode = () => {
		const newMode = mode === 'sign-in' ? 'sign-up' : 'sign-in';
		authModalActions.switchMode(newMode);
		emailValidation.clearErrors();
	};

	const handleWelcomeComplete = async () => {
		toast.success('Profile completed!');
		await authModalActions.handleSuccess();
		window.location.reload();
	};
</script>

<Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
	<DialogContent class="z-[99] sm:max-w-md">
		<DialogHeader>
			<div class="flex items-center gap-3">
				{#if step === 'otp'}
					<button
						type="button"
						onclick={handleBack}
						class="hover:bg-muted -ml-2 rounded-full p-1 transition-colors"
					>
						<ArrowLeft class="h-5 w-5" />
					</button>
				{/if}

				<DialogTitle>
					{#if step === 'welcome'}
						Welcome!
					{:else if step === 'otp'}
						Enter verification code
					{:else}
						{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}
					{/if}
				</DialogTitle>
			</div>

			{#if step !== 'welcome'}
				<DialogDescription>
					{#if step === 'otp'}
						We sent a 6-digit code to <strong>{storedEmail}</strong>
					{:else}
						{mode === 'sign-in'
							? 'Sign in to save your favorite dog-friendly places'
							: 'Join our community of dog lovers'}
					{/if}
				</DialogDescription>
			{/if}
		</DialogHeader>

		{#if step !== 'welcome'}
			<div class="flex gap-2 py-2">
				<div
					class={cn('h-1 flex-1 rounded-full', step === 'email' ? 'bg-primary' : 'bg-muted')}
				></div>
				<div
					class={cn('h-1 flex-1 rounded-full', step === 'otp' ? 'bg-primary' : 'bg-muted')}
				></div>
			</div>
		{/if}

		<div class="space-y-4 py-4">
			{#if step === 'welcome'}
				<!-- Welcome Step -->
				<WelcomeStep email={storedEmail || email} onComplete={handleWelcomeComplete} />
			{:else if step === 'otp'}
				<!-- OTP Step -->
				<form onsubmit={handleOtpSubmit} class="space-y-4">
					<div class="space-y-2">
						<Label for="otp">Verification Code</Label>
						<Input
							id="otp"
							type="text"
							bind:value={otp}
							placeholder="000000"
							maxlength={6}
							pattern="[0-9]*"
							inputmode="numeric"
							disabled={loading}
							autofocus
							class="text-center text-2xl tracking-widest"
						/>
					</div>

					<Button type="submit" class="w-full" disabled={loading || otp.length !== 6}>
						{#if loading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Verifying...
						{:else}
							Verify Code
						{/if}
					</Button>

					<div class="text-center">
						<button
							type="button"
							onclick={handleResendOTP}
							class="text-primary text-sm hover:underline"
							disabled={loading}
						>
							Didn't receive the code? Resend
						</button>
					</div>
				</form>
			{:else}
				<!-- Email Step -->
				<form onsubmit={handleEmailSubmit} class="space-y-4">
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							type="email"
							bind:value={email}
							placeholder="you@example.com"
							disabled={loading || googleLoading}
							autofocus
							class={emailValidation.errors.email ? 'border-red-500' : ''}
						/>
						<ValidationError errors={emailValidation.errors} field="email" />
					</div>

					<Button type="submit" class="w-full" disabled={loading || googleLoading}>
						{#if loading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Sending code...
						{:else}
							Continue with Email
						{/if}
					</Button>
				</form>

				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<span class="w-full border-t"></span>
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span class="bg-background text-muted-foreground px-2">Or</span>
					</div>
				</div>

				<Button
					type="button"
					variant="outline"
					onclick={handleGoogleLogin}
					disabled={loading || googleLoading}
					class="w-full"
				>
					{#if googleLoading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Signing in...
					{:else}
						<GoogleLogo />
						Continue with Google
					{/if}
				</Button>

				<div class="text-muted-foreground text-center text-sm">
					{#if mode === 'sign-in'}
						Don't have an account?
						<button type="button" onclick={switchMode} class="text-primary hover:underline">
							Sign up
						</button>
					{:else}
						Already have an account?
						<button type="button" onclick={switchMode} class="text-primary hover:underline">
							Sign in
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</DialogContent>
</Dialog>
