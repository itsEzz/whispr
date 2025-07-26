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
		align?: 'start' | 'center' | 'end';
		disabled?: boolean;
		label?: string;
		id?: string;
	}

	let {
		content,
		variant,
		class: classes,
		popoverContent,
		align = 'center',
		disabled = false,
		label = 'More information',
		id = 'default'
	}: Props = $props();

	// Variables & States
	let open = $state<boolean>(false);
	const badgeId = `badge-${id}`;
	const popoverId = `popover-${id}`;
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		{disabled}
		aria-label={label}
		aria-expanded={open}
		aria-controls={popoverId}
		aria-describedby={badgeId}
	>
		<Badge {variant} class={cn('gap-2 [&>svg]:!size-auto', classes)} id={badgeId}>
			{#if typeof content === 'string'}
				{content}
			{:else}
				{@render content()}
			{/if}
		</Badge>
	</Popover.Trigger>
	<Popover.Content
		class="mx-2 w-fit max-w-[min(500px,calc(100vw-2rem))] p-2"
		id={popoverId}
		{align}
		role="tooltip"
		aria-live="polite"
	>
		{#if typeof popoverContent === 'string'}
			{popoverContent}
		{:else}
			{@render popoverContent()}
		{/if}
	</Popover.Content>
</Popover.Root>
