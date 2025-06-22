<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { FormControl, FormLabel } from '$lib/components/ui/form';
	import FormFieldErrors from '$lib/components/ui/form/form-field-errors.svelte';
	import FormField from '$lib/components/ui/form/form-field.svelte';
	import { Input } from '$lib/components/ui/input';
	import {
		InputOTP,
		InputOTPGroup,
		InputOTPSeparator,
		InputOTPSlot
	} from '$lib/components/ui/input-otp';
	import { Loader2 } from '@lucide/svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { toast } from 'svelte-sonner';
	import { defaults, superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { z } from 'zod/v4';

	interface Props {
		searchParams: {
			[key: string]: string | string[] | undefined;
		};
		supabase: SupabaseClient;
	}

	let { searchParams, supabase }: Props = $props();

	let loading: boolean = $state(false);

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
		try {
			const { error } = await supabase.auth.verifyOtp({
				email: searchParams.email as string,
				token: pin,
				type: 'email'
			});

			if (error) {
				loading = false;
				throw error;
			} else {
				toast.success('OTP verified successfully! Redirecting...');
				setTimeout(() => {
					goto('/welcome', { keepFocus: true });
				}, 3000);
			}
		} catch (error) {
			console.error('Error verifying OTP:', error);
			toast.error('Failed to verify OTP. Please try again.');
		} finally {
			loading = false;
		}
	};

	const requestNewCode = async () => {
		try {
			const { error } = await supabase.auth.signInWithOtp({
				email: searchParams.email as string,
				options: {
					shouldCreateUser: false
				}
			});

			if (error) {
				toast.error('Failed to get new code. Please try again.');
			} else {
				toast.success('New code sent! Please check your email.');
			}
		} catch (error) {
			console.error('Error requesting new code:', error);
			toast.error('Failed to request new code. Please try again.');
		}
	};
</script>

<div>
	{#if loading}
		<div class="flex-vol flex items-center justify-center gap-3">
			<Loader2 class="size-10 animate-spin" />
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
				<Button variant="link" onclick={requestNewCode}>Request a new code</Button>
			</p>
			<p class="text-muted-foreground mt-5 text-sm">
				Note: A new code can only be requested every 60 seconds. Codes are only valid for 1 hour.
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
							<Button type="submit" disabled={loading}>Verify</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	{/if}
</div>
