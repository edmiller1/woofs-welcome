<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth/stores';
	import { Button } from '$lib/components/ui/button';
	import { FormControl } from '$lib/components/ui/form';
	import FormFieldErrors from '$lib/components/ui/form/form-field-errors.svelte';
	import FormField from '$lib/components/ui/form/form-field.svelte';
	import {
		InputOTP,
		InputOTPGroup,
		InputOTPSeparator,
		InputOTPSlot
	} from '$lib/components/ui/input-otp';
	import { LoaderCircle } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { z } from 'zod/v4';

	interface Props {
		searchParams: {
			[key: string]: string | string[] | undefined;
		};
	}

	let { searchParams }: Props = $props();

	let loading = $state<boolean>(false);
	let cooldownSeconds = $state<number>(0);

	const formSchema = z.object({
		pin: z
			.string()
			.length(6, { message: 'Code must be exactly 6 digits' })
			.regex(/^\d+$/, { message: 'Code must contain only numbers' })
	});

	const form = superForm(defaults(zod4(formSchema)), {
		validators: zod4(formSchema),
		SPA: true,
		onUpdate: ({ form: f }) => {
			if (f.valid) {
			} else {
				toast.error('Please enter a valid 6-digit code.');
			}
		}
	});

	const { form: formData, enhance } = form;

	$effect(() => {
		if ($formData.pin && $formData.pin.length === 6) {
			verifyPin($formData.pin);
		}
	});

	const verifyPin = async (pin: string) => {
		if (loading) return;

		try {
			const result = await auth.verifyOtp(searchParams.email as string, pin);

			if (result.error) {
				toast.error(result.error.message || 'Failed to verify code');
				formData.set({ pin: '' });
				return;
			}

			toast.success('Code verified successfully!');
			if (result.data.user.name) {
				goto('/');
			} else {
				goto('/welcome?email=' + encodeURIComponent(result.data.user.email), { keepFocus: true });
			}
		} catch (error) {
			console.error('OTP verification error: ', error);
			toast.error('Failed to verify code. Please try again.');
			formData.set({ pin: '' });
		} finally {
			loading = false;
		}
	};

	const requestNewCode = async () => {
		if (cooldownSeconds > 0) return;

		try {
			const result = await auth.resendOTP(searchParams.email as string, 'sign-in');

			if (result.error) {
				toast.error('Failed to send new code');
				return;
			}

			toast.success('New verification code sent!');

			cooldownSeconds = 60;
			const interval = setInterval(() => {
				cooldownSeconds--;
				if (cooldownSeconds <= 0) {
					clearInterval(interval);
				}
			}, 1000);
		} catch (error) {
			console.error('Error requesting new code:', error);
			toast.error('Failed to request new code');
		}
	};
</script>

<div>
	{#if loading}
		<div class="flex-vol flex items-center justify-center gap-3">
			<LoaderCircle class="size-10 animate-spin" />
			<p>Verifying...</p>
		</div>
	{:else}
		<div>
			<p>
				Enter the 6 digit code sent to <span class="font-bold">
					{searchParams.email}
				</span>
			</p>
			<p>
				Didn't receive a code?
				<Button variant="link" onclick={requestNewCode} disabled={cooldownSeconds > 0}>
					{cooldownSeconds > 0 ? `Request new code (${cooldownSeconds}s)` : 'Request a new code'}
				</Button>
			</p>
			<p class="text-muted-foreground mt-5 text-sm">
				Note: A new code can only be requested every 60 seconds. Codes are only valid for 5 minutes.
			</p>
			<div class="mt-10 flex items-center justify-center">
				<div>
					<form use:enhance onsubmit={() => verifyPin($formData.pin)} class="flex flex-col gap-6">
						<FormField {form} name="pin">
							<FormControl>
								{#snippet children({ props })}
									<InputOTP maxlength={6} {...props} bind:value={$formData.pin}>
										{#snippet children({ cells })}
											<InputOTPGroup>
												{#each cells.slice(0, 3) as cell}
													<InputOTPSlot {cell} />
												{/each}
											</InputOTPGroup>
											<InputOTPSeparator />
											<InputOTPGroup>
												{#each cells.slice(3, 6) as cell}
													<InputOTPSlot {cell} />
												{/each}
											</InputOTPGroup>
										{/snippet}
									</InputOTP>
								{/snippet}
							</FormControl>
							<FormFieldErrors />
						</FormField>
						<div class="mt-6 flex items-center justify-between">
							<Button variant="outline" onclick={() => form.reset()} disabled={loading}>
								Clear
							</Button>
							<Button type="submit" disabled={loading || $formData.pin.length !== 6}>Verify</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	{/if}
</div>
