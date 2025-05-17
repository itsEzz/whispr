<script lang="ts">
	import { Badge, type BadgeVariant } from '$lib/components/ui/badge/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	// Props
	interface Props {
		content: string | Snippet;
		variant?: BadgeVariant;
		class?: string;
		popoverContent: string | Snippet;
	}

	let { content, variant, class: classes, popoverContent }: Props = $props();
</script>

<Popover.Root>
	<Popover.Trigger>
		<Badge {variant} class={cn('h-7', classes)}>
			{#if typeof content === 'string'}
				{content}
			{:else}
				{@render content()}
			{/if}
		</Badge>
	</Popover.Trigger>
	<Popover.Content class="mx-2 w-fit max-w-[min(500px,calc(100vw-2rem))] p-2">
		{#if typeof popoverContent === 'string'}
			{popoverContent}
		{:else}
			{@render popoverContent()}
		{/if}
	</Popover.Content>
</Popover.Root>
