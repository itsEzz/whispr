<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { CreateSchema } from '$lib/schemas/create-schema';
	import type { PasswordComponent } from '$lib/types/password';
	import { MediaQuery } from 'svelte/reactivity';
	import type { Infer } from 'sveltekit-superforms';
	import type { SuperForm, ValidationErrors } from 'sveltekit-superforms/client';
	import AdditionalOptions from './additional-options.svelte';
	import PasswordOptions from './password-options.svelte';
	import TtlOptions from './ttl-options.svelte';
	import ViewOptions from './view-options.svelte';

	// Props
	interface Props {
		form: SuperForm<Infer<CreateSchema>>;
		password: string;
		passwordOptionsComponent: PasswordComponent;
		disabled?: boolean;
	}

	let {
		form,
		password = $bindable(),
		passwordOptionsComponent,
		disabled = false
	}: Props = $props();

	// Variables & States
	// svelte-ignore state_referenced_locally
	const { errors, submitting } = form;
	let openOptions = $state<string>('options');
	const isDesktop = new MediaQuery('(min-width: 640px)');
	const optionKeys: (keyof ValidationErrors<Infer<CreateSchema>>)[] = [
		'views',
		'showViews',
		'unlimitedViews',
		'ttlValue',
		'ttlUnit',
		'showTtl',
		'showCopyButton',
		'showDownloadButton'
	];
	let errorCount = $derived.by(() => {
		const passwordErrors = passwordOptionsComponent?.getErrors() || [];
		const passwordErrorCount = passwordErrors.length;

		const formErrorCount = optionKeys.reduce((sum, key) => {
			const fieldErrors = $errors[key] || [];
			return sum + fieldErrors.length;
		}, 0);

		return passwordErrorCount + formErrorCount;
	});
</script>

{#snippet options()}
	<Card.Root>
		<Card.Content
			class="p-4 px-0"
			id="whispr-options-content"
			role="region"
			aria-label="Whispr options"
		>
			<PasswordOptions
				bind:password
				bind:this={passwordOptionsComponent}
				disabled={$submitting || disabled}
			/>
			<div class="bg-muted-foreground/20 mt-4 mb-2 h-px w-full" aria-hidden="true"></div>
			<ViewOptions {form} {disabled} />
			<div class="bg-muted-foreground/20 mt-4 mb-2 h-px w-full" aria-hidden="true"></div>
			<TtlOptions {form} {disabled} />
			<div class="bg-muted-foreground/20 mt-4 mb-2 h-px w-full" aria-hidden="true"></div>
			<AdditionalOptions {form} {disabled} />
		</Card.Content>
	</Card.Root>
{/snippet}

{#if isDesktop.current}
	{@render options()}
{:else}
	<Accordion.Root type="single" bind:value={openOptions}>
		<Accordion.Item value="options" class="border-none" id="whispr-options">
			<Accordion.Trigger
				class="rounded-lg border px-4 hover:no-underline"
				aria-expanded={openOptions === 'options'}
				aria-controls="whispr-options-content"
			>
				<span>
					{openOptions === 'options' ? 'Hide' : 'Show'} options
					{#if errorCount > 0}
						<Badge
							variant="destructive"
							class="ml-2"
							aria-label={`${errorCount} validation ${errorCount === 1 ? 'issue' : 'issues'}`}
						>
							{errorCount} issue{errorCount === 1 ? '' : 's'}
						</Badge>
					{/if}
				</span>
			</Accordion.Trigger>
			<Accordion.Content class="mt-2">
				{@render options()}
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
{/if}
