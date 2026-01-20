<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Switch } from '$lib/components/ui/switch';
	import type { Infer } from 'sveltekit-superforms';
	import type { SuperForm } from 'sveltekit-superforms/client';
	import type { CreateSchema } from '../../schemas/create-schema';
	import FormError from '../common/form-error.svelte';

	// Props
	interface Props {
		form: SuperForm<Infer<CreateSchema>>;
		disabled?: boolean;
	}

	let { form, disabled = false }: Props = $props();

	// Variables & States
	// svelte-ignore state_referenced_locally
	const { form: formData, errors, constraints, submitting } = form;
</script>

<div class="space-y-3 px-4">
	<h3 class="text-sm leading-none font-medium" id="additional-options-heading">
		Additional options
	</h3>
	<div role="group" aria-labelledby="additional-options-heading" class="space-y-3">
		<Form.Field {form} name="showCopyButton">
			<Form.Control>
				{#snippet children({ props })}
					<div class="flex items-center gap-2">
						<Switch
							{...props}
							{...$constraints.showCopyButton}
							bind:checked={$formData.showCopyButton}
							disabled={$submitting || disabled}
							aria-describedby={$errors.showCopyButton ? 'show-copy-button-error' : undefined}
						/>
						<Form.Label class="cursor-pointer">Show copy button</Form.Label>
					</div>
				{/snippet}
			</Form.Control>
			<FormError errors={$errors.showCopyButton} id="show-copy-button-error" />
		</Form.Field>
		<Form.Field {form} name="showDownloadButton">
			<Form.Control>
				{#snippet children({ props })}
					<div class="flex items-center gap-2">
						<Switch
							{...props}
							{...$constraints.showDownloadButton}
							bind:checked={$formData.showDownloadButton}
							disabled={$submitting || disabled}
							aria-describedby={$errors.showDownloadButton
								? 'show-download-button-error'
								: undefined}
						/>
						<Form.Label class="cursor-pointer">Show download button</Form.Label>
					</div>
				{/snippet}
			</Form.Control>
			<FormError errors={$errors.showDownloadButton} id="show-download-button-error" />
		</Form.Field>
	</div>
</div>
