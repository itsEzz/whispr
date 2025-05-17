<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import DialogDrawer from '../common/dialog-drawer.svelte';

	// Props
	interface Props {
		open: boolean;
		onConfirm: () => void;
	}

	let { open = $bindable(), onConfirm }: Props = $props();

	// Handler Functions
	function handleCloseDialog() {
		open = false;
	}

	function handleClickConfirm() {
		onConfirm();
		handleCloseDialog();
	}
</script>

<DialogDrawer bind:open title="Navigate away?">
	{#snippet body()}
		<div class="space-y-2">
			<p class="text-sm text-muted-foreground">
				If you leave this page, the data you've entered will be lost.
			</p>
			<p class="text-sm text-muted-foreground">Are you sure you want to leave?</p>
		</div>
	{/snippet}
	{#snippet footer()}
		<Button variant="secondary" onclick={handleCloseDialog}>Stay on page</Button>
		<Button variant="destructive" onclick={handleClickConfirm}>Leave page</Button>
	{/snippet}
</DialogDrawer>
