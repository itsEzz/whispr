<script lang="ts">
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import X from '@lucide/svelte/icons/x';

	// Props
	interface Props {
		show: boolean;
	}

	let { show }: Props = $props();

	// States
	let hideSchedulerAlert = $state<boolean>(false);

	// Handler Functions
	function handleDismissAlert() {
		hideSchedulerAlert = true;
	}
</script>

{#if show && !hideSchedulerAlert}
	<div class="container mx-auto px-4 pt-4">
		<Alert.Root class="border-destructive/20 bg-destructive/10">
			<TriangleAlert aria-hidden="true" />
			<Alert.Title>Service issue detected</Alert.Title>
			<Alert.Description>
				This instance has a critical configuration issue. All website features are currently
				disabled until this issue is fixed.<br /> We're sorry for the inconvenience. Please contact the
				site administrator to resolve this issue.
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
