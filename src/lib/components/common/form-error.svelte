<script lang="ts">
	import AlertCircle from '@lucide/svelte/icons/alert-circle';

	// Props
	interface Props {
		errors?: string[];
		id?: string;
	}

	let { errors, id = 'form-error' }: Props = $props();
</script>

{#if errors && errors.length > 0}
	<div
		class="text-destructive mt-2 space-y-1.5 text-sm font-medium"
		{id}
		role="alert"
		aria-live="polite"
	>
		{#each errors as error}
			<div class="bg-destructive/10 flex items-start rounded-sm px-3 py-2">
				<AlertCircle size={16} class="mt-0.5 mr-2 shrink-0" aria-hidden="true" />
				<span class="leading-tight">{error}</span>
			</div>
		{/each}
	</div>
{/if}
