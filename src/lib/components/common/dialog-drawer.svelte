<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { AriaRole } from 'svelte/elements';
	import { MediaQuery } from 'svelte/reactivity';

	// Props
	interface Props {
		open: boolean;
		onOpenChange?: (open: boolean) => void;
		title: string | Snippet;
		description?: string | Snippet;
		body?: Snippet;
		footer?: Snippet;
		drawerContentCss?: string;
		dialogContentCss?: string;
		escapeKeydownBehavior?: 'ignore' | 'close' | 'defer-otherwise-close' | 'defer-otherwise-ignore';
		interactOutsideBehavior?:
			| 'ignore'
			| 'close'
			| 'defer-otherwise-close'
			| 'defer-otherwise-ignore';
		idToFocusOnOpen?: string;
		role?: AriaRole;
		'aria-describedby'?: string;
		'aria-labelledby'?: string;
	}

	// eslint-disable-next-line svelte/no-unused-props
	let {
		open = $bindable(),
		onOpenChange,
		title,
		description,
		body,
		footer,
		drawerContentCss,
		dialogContentCss = 'sm:max-w-[425px]',
		escapeKeydownBehavior = 'close',
		interactOutsideBehavior = 'close',
		idToFocusOnOpen,
		role,
		'aria-describedby': ariaDescribedby = 'dialog-description',
		'aria-labelledby': ariaLabelledby = 'dialog-title'
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
			{role}
			aria-describedby={ariaDescribedby}
			aria-labelledby={ariaLabelledby}
		>
			<Dialog.Header>
				<Dialog.Title id={ariaLabelledby}>
					{#if typeof title === 'string'}
						{title}
					{:else}
						{@render title()}
					{/if}
				</Dialog.Title>
				{#if description}
					<Dialog.Description id={ariaDescribedby}>
						{#if typeof description === 'string'}
							{description}
						{:else}
							{@render description()}
						{/if}
					</Dialog.Description>
				{/if}
			</Dialog.Header>
			<div id={!description ? ariaDescribedby : undefined}>
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
		<Drawer.Content
			class={drawerContentCss}
			{escapeKeydownBehavior}
			{interactOutsideBehavior}
			{onOpenAutoFocus}
			{role}
			aria-describedby={ariaDescribedby}
			aria-labelledby={ariaLabelledby}
		>
			<Drawer.Header>
				<Drawer.Title id={ariaLabelledby}>
					{#if typeof title === 'string'}
						{title}
					{:else}
						{@render title()}
					{/if}
				</Drawer.Title>
				{#if description}
					<Drawer.Description id={ariaDescribedby}>
						{#if typeof description === 'string'}
							{description}
						{:else}
							{@render description()}
						{/if}
					</Drawer.Description>
				{/if}
			</Drawer.Header>
			<div
				id={!description ? ariaDescribedby : undefined}
				class={cn('mx-4 flex-1 overflow-y-auto', !footer && 'mb-4')}
			>
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
