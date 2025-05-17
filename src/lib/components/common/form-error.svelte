<script lang="ts">
	import { AlertCircle } from 'lucide-svelte';

	// Props
	interface Props {
		errors?: string[];
	}

	let { errors }: Props = $props();
</script>

{#if errors && errors.length > 0}
	<div class="ml-1 space-y-1">
		{#each errors as error}
			<p class="flex items-center text-sm font-medium text-destructive">
				<AlertCircle class="mr-1.5 h-4 w-4" />
				{error}
			</p>
		{/each}
	</div>
{/if}
