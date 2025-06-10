<script lang="ts">
	import { Button, type ButtonProps } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Copy from '@lucide/svelte/icons/copy';

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
		copyTimeout = 2500,
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
	aria-label={buttonText ||
		(copyStatus === 'idle'
			? 'Copy to clipboard'
			: copyStatus === 'copied'
				? 'Copied to clipboard'
				: 'Copy failed')}
	aria-live="polite"
	aria-disabled={copyStatus !== 'idle'}
>
	{#if buttonText}
		<span>{buttonText}</span>
	{/if}
	{#if copyStatus === 'idle'}
		<Copy aria-hidden="true" />
	{:else if copyStatus === 'copied'}
		<CircleCheck aria-hidden="true" />
	{:else if copyStatus === 'failed'}
		<CircleX aria-hidden="true" />
	{/if}
</Button>
