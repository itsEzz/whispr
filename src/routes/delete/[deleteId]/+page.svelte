<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import DialogDrawer from '$lib/components/common/dialog-drawer.svelte';
	import FormError from '$lib/components/common/form-error.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { deleteSchema } from '$lib/schemas/delete-schema';
	import { cn } from '$lib/utils.js';
	import { isError, tc } from '@itsezz/try-catch';
	import Home from '@lucide/svelte/icons/home';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import SearchX from '@lucide/svelte/icons/search-x';
	import Shredder from '@lucide/svelte/icons/shredder';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import SvelteSeo from 'svelte-seo';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import type { PageProps } from './$types';

	// Props
	let { data }: PageProps = $props();

	// Variables & States
	let deleted = $state<boolean>(false);
	// svelte-ignore state_referenced_locally
	const form = superForm(data.form, {
		validators: zod4Client(deleteSchema),
		onSubmit({ formData }) {
			if (page.params.deleteId) {
				formData.set('id', page.params.deleteId);
			}
			return formData;
		},
		onUpdate({ result }) {
			if (result.type !== 'success') {
				if (result.data.error.title || result.data.error.description)
					toast.error(result.data.error.title, { description: result.data.error.description });
				return;
			}
			deleted = true;
		},
		onError({ result }) {
			if (result.status === 429) {
				const parseResult = tc(() => JSON.parse(result.error.message));
				if (isError(parseResult)) {
					toast.error('Rate limit exceeded', {
						description: 'Too many requests. Please wait before trying again.',
						duration: 8000
					});
					return;
				}
				toast.error(parseResult.data.title || 'Rate limit exceeded', {
					description:
						parseResult.data.message ||
						`Too many requests. Please wait ${parseResult.data.retryAfter || 60} seconds before trying again.`,
					duration: 8000
				});
			} else {
				toast.error('Something went wrong', {
					description: 'Please try again in a moment.'
				});
			}
		}
	});

	const { form: formData, enhance, submitting, allErrors, constraints, errors } = form;

	let isFormValid = $derived($allErrors.length === 0);

	// Functions
	function onOpenChangeDeletedDialog(open: boolean) {
		if (open === true) return;
		goto(resolve('/'));
	}
</script>

<SvelteSeo
	title="Delete Whispr - Secure Message Management"
	description="Delete secure message."
	noindex={true}
	nofollow={true}
	nositelinkssearchbox={true}
/>

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
									<div class="flex items-center gap-2">
										<Checkbox
											{...props}
											{...$constraints.confirm}
											bind:checked={$formData.confirm}
											disabled={$submitting || !data.schedulerIsValid}
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

					<Card.Footer class="flex justify-end pt-6">
						<Form.Button
							disabled={$submitting || !isFormValid || !data.schedulerIsValid}
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
					<Card.Title class="text-2xl" id="error-heading">Whispr Not Found</Card.Title>
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
{/if}
