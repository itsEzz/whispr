<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ConfirmNavigateAway from '$lib/components/common/confirm-navigate-away.svelte';
	import FormError from '$lib/components/common/form-error.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { viewSchema } from '$lib/schemas/view-schema';
	import { cn } from '$lib/utils.js';
	import Eye from '@lucide/svelte/icons/eye';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import type { PageProps } from './$types.js';

	// Props
	let { data }: PageProps = $props();

	// Variables & States
	let openNavigateAwayDialog = $state<{
		open: boolean;
		onConfirm: () => void;
	}>({ open: false, onConfirm: () => {} });
	const form = superForm(data.form, {
		validators: zod4Client(viewSchema),
		onUpdate({ form, result }) {
			if (result.type !== 'success') {
				if (result.data.error.title || result.data.error.description) {
					toast.error(result.data.error.title, {
						description: result.data.error.description
					});
				}
				return;
			}
			return form.data;
		},
		taintedMessage: () => {
			return new Promise(
				(resolve) => (openNavigateAwayDialog = { open: true, onConfirm: () => resolve(true) })
			);
		}
	});

	const { form: formData, enhance, submitting, allErrors, errors, constraints, submit } = form;

	let isFormValid = $derived($allErrors.length === 0);

	$effect(() => {
		const redirectReason = page.url.searchParams.get('redirect-reason');
		if (!redirectReason) return;

		if (redirectReason === 'invalid-id') {
			toast.info('Whispr not found', {
				description: 'The whispr you are looking for does not exist or has expired.',
				duration: 10000
			});
		} else if (redirectReason === 'expired') {
			toast.info('Whispr expired', {
				description: 'The whispr you are trying to view has just expired.',
				duration: 10000
			});
		}

		const url = new URL(window.location.href);
		url.searchParams.delete('redirect-reason');
		goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true });
	});
</script>

<ConfirmNavigateAway
	bind:open={openNavigateAwayDialog.open}
	onConfirm={openNavigateAwayDialog.onConfirm}
/>

<div class="container mx-auto flex h-full flex-col overflow-hidden p-4">
	<div class="mt-12 flex justify-center sm:mt-16 md:mt-20">
		<Card.Root class="w-full max-w-md">
			<Card.Header>
				<Card.Title id="page-title">
					<div class="flex items-center">
						<Eye class="mr-2" aria-hidden="true" /> View Whispr
					</div>
				</Card.Title>
				<Card.Description>Provide your Whispr ID to view the secure content.</Card.Description>
			</Card.Header>

			<Card.Content>
				<form method="POST" use:enhance autocomplete="off">
					<Form.Field {form} name="id">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Whispr ID</Form.Label>
								<Input
									{...props}
									{...$constraints.id}
									bind:value={$formData.id}
									placeholder="e.g., apple-tree-house"
									aria-describedby={$errors.id ? 'id-error' : undefined}
									class={cn($errors.id && 'border-destructive focus-visible:ring-destructive/50')}
									autocomplete="off"
									autofocus
								/>
							{/snippet}
						</Form.Control>
						<FormError errors={$errors.id} id="id-error" />
					</Form.Field>
				</form>
			</Card.Content>

			<Card.Footer class="flex justify-end">
				<Form.Button
					disabled={$submitting || !isFormValid}
					aria-busy={$submitting}
					onclick={submit}
				>
					{#if $submitting}
						Loading Whispr...
						<LoaderCircle class="animate-spin" aria-hidden="true" />
					{:else}
						View Whispr
						<Eye aria-hidden="true" />
					{/if}
				</Form.Button>
			</Card.Footer>
		</Card.Root>
	</div>
</div>
