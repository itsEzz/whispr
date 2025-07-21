<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import DialogDrawer from './dialog-drawer.svelte';

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

<DialogDrawer
	bind:open
	title="Reset form?"
	role="alertdialog"
	aria-labelledby="reset-form-title"
	aria-describedby="reset-form-description"
>
	{#snippet body()}
		<p class="text-muted-foreground text-sm">
			This action will reset all fields to their default values.
		</p>
	{/snippet}
	{#snippet footer()}
		<Button variant="secondary" onclick={handleCloseDialog} aria-label="Cancel form reset">
			Cancel
		</Button>
		<Button
			variant="destructive"
			onclick={handleClickConfirm}
			aria-label="Reset form to default values"
			autofocus
		>
			Reset form
		</Button>
	{/snippet}
</DialogDrawer>
