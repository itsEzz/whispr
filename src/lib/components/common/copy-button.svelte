<script lang="ts">
	import { Button, type ButtonProps } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils';
	import { CircleCheck, CircleX, Copy } from 'lucide-svelte';

	// Props
	interface Props extends Omit<ButtonProps, 'onclick'> {
		text?: string;
		copySuccessText?: string;
		copyFailedText?: string;
		copyTimeout?: number;
		copyFn: () => Promise<boolean>;
		class?: string;
	}

	let {
		text,
		copySuccessText,
		copyFailedText,
		copyTimeout = 3000,
		copyFn,
		class: classes,
		...buttonProps
	}: Props = $props();

	// Variables & States
	let copyStatus = $state<'idle' | 'copied' | 'failed'>('idle');
	let buttonText = $derived.by(() => {
		if (copyStatus === 'idle') return text;
		else if (copyStatus === 'copied') return copySuccessText;
		else if (copyStatus === 'failed') return copyFailedText;
	});

	// Handler Functions
	async function handleClick() {
		if (copyStatus !== 'idle') return;
		copyStatus = (await copyFn()) ? 'copied' : 'failed';

		setTimeout(() => {
			copyStatus = 'idle';
		}, copyTimeout);
	}
</script>

<Button
	{...buttonProps}
	onclick={handleClick}
	class={cn(classes, copyStatus !== 'idle' && 'cursor-default')}
>
	{buttonText}
	{#if copyStatus === 'idle'}
		<Copy />
	{:else if copyStatus === 'copied'}
		<CircleCheck />
	{:else if copyStatus === 'failed'}
		<CircleX />
	{/if}
</Button>
