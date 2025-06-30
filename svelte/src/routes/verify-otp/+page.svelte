<script lang="ts">
	import { OtpForm } from './components/index';

	let { data } = $props();
	let { searchParams } = $derived(data);
</script>

<div class="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
	<h1 class="text-3xl">Enter OTP Code</h1>
	<div class="mt-6 flex flex-col text-center">
		<OtpForm {searchParams} />
	</div>
</div>
