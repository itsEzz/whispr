<script lang="ts">
	import FormError from '$lib/components/common/form-error.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { deleteSchema } from '$lib/schemas/delete-schema';
	import { cn } from '$lib/utils.js';
	import { AlertTriangle, Home, LoaderCircle, SearchX, Shredder, Trash2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { PageProps } from './$types';
	import DialogDrawer from '$lib/components/common/dialog-drawer.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	// Props
	let { data }: PageProps = $props();

	// Variables & States
	let deleted = $state<boolean>(false);
	const form = superForm(data.form, {
		validators: zodClient(deleteSchema),
		onSubmit({ formData }) {
			formData.set('id', page.params.deleteId);
			return formData;
		},
		onUpdate({ result }) {
			if (result.type !== 'success') {
				if (result.data.error.title || result.data.error.description)
					toast.error(result.data.error.title, { description: result.data.error.description });
				return;
			}
			deleted = true;
		}
	});

	const { form: formData, enhance, submitting, allErrors, constraints, errors } = form;

	let isFormValid = $derived($allErrors.length === 0);

	// Functions
	function onOpenChangeDeletedDialog(open: boolean) {
		if (open === true) return;
		goto('/');
	}
</script>

<DialogDrawer
	open={deleted}
	onOpenChange={onOpenChangeDeletedDialog}
	dialogContentCss="sm:max-w-sm"
	aria-labelledby="whispr-deleted-dialog-title"
	aria-describedby="whispr-deleted-dialog-description"
	role="dialog"
>
	{#snippet title()}
		<div class="flex items-center">
			<Shredder class="mr-2 text-green-500" aria-hidden="true" /> Whispr deleted!
		</div>
	{/snippet}
	{#snippet body()}
		<p class="text-muted-foreground text-sm">
			You'll be redirected to the homepage once you close this dialog or by clicking the button
			below.
		</p>
	{/snippet}
	{#snippet footer()}
		<Button href="/" aria-label="Go back to home page">
			Back to Home
			<Home aria-hidden="true" />
		</Button>
	{/snippet}
</DialogDrawer>

{#if !deleted}
	<div class="container mx-auto flex h-full flex-col overflow-hidden p-4">
		<div class="mt-12 flex justify-center sm:mt-16 md:mt-20">
			{#if !data.notFound}
				<Card.Root class="w-full max-w-lg">
					<Card.Header>
						<Card.Title>
							<div class="flex items-center">
								<Shredder class="mr-2" aria-hidden="true" /> Delete Whispr
							</div>
						</Card.Title>
						<Card.Description>
							Permanently remove your Whispr so it can no longer be accessed by anyone.
						</Card.Description>
					</Card.Header>
					<form method="POST" use:enhance autocomplete="off">
						<Card.Content class="space-y-2">
							<Form.Field
								{form}
								name="confirm"
								class="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4"
							>
								<Form.Control>
									{#snippet children({ props })}
										<div class="flex items-center space-x-2">
											<Checkbox
												{...props}
												{...$constraints.confirm}
												bind:checked={$formData.confirm}
												disabled={$submitting}
												aria-describedby={$errors.confirm
													? 'confirm-error confirm-description'
													: 'confirm-description'}
												class={cn(
													$errors.confirm && 'border-destructive focus-visible:ring-destructive/50'
												)}
											/>
											<div class="space-y-1 leading-none">
												<Form.Label>I understand this action cannot be undone</Form.Label>
												<Form.Description id="confirm-description">
													Once deleted, your Whispr will be gone forever.
												</Form.Description>
											</div>
										</div>
									{/snippet}
								</Form.Control>
							</Form.Field>
							<FormError errors={$errors.confirm} id="confirm-error" />
						</Card.Content>

						<Card.Footer class="flex justify-end">
							<Form.Button
								disabled={$submitting || !isFormValid}
								aria-busy={$submitting}
								variant="destructive"
							>
								{$submitting ? 'Deleting...' : 'Delete Whispr'}
								{#if $submitting}
									<LoaderCircle class="animate-spin" aria-hidden="true" />
								{:else}
									<Trash2 aria-hidden="true" />
								{/if}
							</Form.Button>
						</Card.Footer>
					</form>
				</Card.Root>
			{:else if data.notFound}
				<Card.Root class="w-full max-w-lg">
					<Card.Header class="text-center">
						<div
							class="bg-muted/50 mx-auto mb-4 flex size-16 items-center justify-center rounded-full"
						>
							<SearchX size={40} aria-hidden="true" />
						</div>
						<Card.Title id="error-heading">Whispr Not Found</Card.Title>
					</Card.Header>

					<Card.Content class="text-center">
						<p class="text-muted-foreground text-sm">
							The Whispr you're trying to delete either doesn't exist or has already been removed.
							Please double-check the link for any typos.
						</p>
					</Card.Content>

					<Card.Footer class="flex justify-center">
						<Button href="/" aria-label="Go back to home page">
							Back to Home
							<Home aria-hidden="true" />
						</Button>
					</Card.Footer>
				</Card.Root>
			{/if}
		</div>
	</div>
{/if}
