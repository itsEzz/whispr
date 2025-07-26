<script lang="ts">
	import { browser } from '$app/environment';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ShieldAlert from '@lucide/svelte/icons/shield-alert';
	import X from '@lucide/svelte/icons/x';
	import { onMount } from 'svelte';

	// States
	let isInsecureConnection = $state<boolean>(false);

	// Handler Functions
	function handleDismissAlert() {
		isInsecureConnection = false;
	}

	// Lifecylce
	onMount(() => {
		if (browser && !window.isSecureContext) isInsecureConnection = true;
	});

	$inspect(isInsecureConnection);
</script>

{#if isInsecureConnection}
	<div class="container mx-auto px-4 pt-4">
		<Alert.Root
			class="border-orange-300/30 bg-orange-500/10 dark:border-orange-400/30 dark:bg-orange-400/10"
		>
			<ShieldAlert aria-hidden="true" />
			<Alert.Title>Insecure Connection</Alert.Title>
			<Alert.Description>
				This site is not using HTTPS encryption. Your data may be visible to others and could be
				intercepted or modified during transmission. While you can still use this service, be aware
				that:
				<ul class="list-disc pl-5">
					<li>Your messages and passwords are not encrypted in transit</li>
					<li>Third parties may be able to read or modify your data</li>
					<li>Your connection is vulnerable to man-in-the-middle attacks</li>
				</ul>
				For maximum security, use an HTTPS-enabled instance of this service.
			</Alert.Description>
			<Button
				variant="ghost"
				size="sm"
				class="absolute top-2 right-2 h-6 w-6 p-0"
				onclick={handleDismissAlert}
				aria-label="Dismiss alert"
			>
				<X class="h-4 w-4" aria-hidden="true" />
			</Button>
		</Alert.Root>
	</div>
{/if}
