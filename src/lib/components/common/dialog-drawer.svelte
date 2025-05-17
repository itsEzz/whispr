<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';

	// Props
	interface Props {
		open: boolean;
		onOpenChange?: (open: boolean) => void;
		title: string | Snippet;
		description?: string | Snippet;
		body?: Snippet;
		footer?: Snippet;
		drawerBodyCss?: string;
		dialogContentCss?: string;
		escapeKeydownBehavior?: 'ignore' | 'close' | 'defer-otherwise-close' | 'defer-otherwise-ignore';
		interactOutsideBehavior?:
			| 'ignore'
			| 'close'
			| 'defer-otherwise-close'
			| 'defer-otherwise-ignore';
		idToFocusOnOpen?: string;
	}

	let {
		open = $bindable(),
		onOpenChange,
		title,
		description,
		body,
		footer,
		drawerBodyCss,
		dialogContentCss = 'sm:max-w-[425px]',
		escapeKeydownBehavior = 'close',
		interactOutsideBehavior,
		idToFocusOnOpen
	}: Props = $props();

	// Variables & States
	const isDesktop = new MediaQuery('(min-width: 768px)');

	// Functions
	function onOpenAutoFocus(event: Event) {
		if (!idToFocusOnOpen) return;

		event.preventDefault();
		const element = document.getElementById(idToFocusOnOpen);
		if (element) element.focus();
	}
</script>

{#if isDesktop.current}
	<Dialog.Root bind:open {onOpenChange}>
		<Dialog.Content
			class={dialogContentCss}
			{escapeKeydownBehavior}
			{interactOutsideBehavior}
			{onOpenAutoFocus}
		>
			<Dialog.Header>
				<Dialog.Title>
					{#if typeof title === 'string'}
						{title}
					{:else}
						{@render title()}
					{/if}
				</Dialog.Title>
				{#if description}
					<Dialog.Description>
						{#if typeof description === 'string'}
							{description}
						{:else}
							{@render description()}
						{/if}
					</Dialog.Description>
				{/if}
			</Dialog.Header>
			<div class="max-h-[70dvh] overflow-y-auto">
				{@render body?.()}
			</div>
			{#if footer}
				<Dialog.Footer>
					{@render footer()}
				</Dialog.Footer>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Drawer.Root bind:open {onOpenChange}>
		<Drawer.Content {escapeKeydownBehavior} {interactOutsideBehavior} {onOpenAutoFocus}>
			<Drawer.Header class="text-left">
				<Drawer.Title>
					{#if typeof title === 'string'}
						{title}
					{:else}
						{@render title()}
					{/if}</Drawer.Title
				>
				{#if description}
					<Drawer.Description>
						{#if typeof description === 'string'}
							{description}
						{:else}
							{@render description()}
						{/if}
					</Drawer.Description>
				{/if}
			</Drawer.Header>
			<div class={cn(drawerBodyCss, 'mx-4 max-h-[70dvh] overflow-y-auto')}>
				{@render body?.()}
			</div>
			{#if footer}
				<Drawer.Footer>
					{@render footer()}
				</Drawer.Footer>
			{/if}
		</Drawer.Content>
	</Drawer.Root>
{/if}
