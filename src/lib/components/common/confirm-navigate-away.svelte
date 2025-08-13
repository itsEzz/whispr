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

<DialogDrawer
	bind:open
	title="Navigate away?"
	role="alertdialog"
	aria-labelledby="navigate-away-title"
	aria-describedby="navigate-away-description"
>
	{#snippet body()}
		<div class="flex flex-col gap-2">
			<p class="text-muted-foreground text-sm">
				If you leave this page, the data you've entered will be lost.
			</p>
			<p class="text-muted-foreground text-sm">Are you sure you want to leave?</p>
		</div>
	{/snippet}
	{#snippet footer()}
		<Button variant="secondary" onclick={handleCloseDialog} aria-label="Stay on current page">
			Stay on page
		</Button>
		<Button
			variant="destructive"
			onclick={handleClickConfirm}
			aria-label="Leave page and discard changes"
			autofocus
		>
			Leave page
		</Button>
	{/snippet}
</DialogDrawer>
