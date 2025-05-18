<script lang="ts">
	import { AlertCircle } from 'lucide-svelte';

	// Props
	interface Props {
		errors?: string[];
		id?: string;
	}

	let { errors, id = 'form-error' }: Props = $props();
</script>

{#if errors && errors.length > 0}
	<div
		class="mt-2 space-y-1.5 text-sm font-medium text-destructive"
		{id}
		role="alert"
		aria-live="polite"
	>
		{#each errors as error}
			<div class="flex items-start rounded-sm bg-destructive/10 px-3 py-2">
				<AlertCircle class="mr-2 mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
				<span class="leading-tight">{error}</span>
			</div>
		{/each}
	</div>
{/if}
