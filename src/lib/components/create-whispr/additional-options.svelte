<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Switch } from '$lib/components/ui/switch';
	import { cn } from '$lib/utils';
	import type { Infer } from 'sveltekit-superforms';
	import type { SuperForm, SuperFormData } from 'sveltekit-superforms/client';
	import type { CreateSchema } from '../../schemas/create-schema';
	import FormError from '../common/form-error.svelte';

	// Props
	interface Props {
		form: SuperForm<Infer<CreateSchema>>;
		formData: SuperFormData<Infer<CreateSchema>>;
	}

	let { form, formData }: Props = $props();

	// Variables & States
	const { errors, constraints, submitting } = form;
</script>

<div class="space-y-3 px-4">
	<h3 class="text-sm font-medium leading-none" id="additional-options-heading">
		Additional options
	</h3>
	<div role="group" aria-labelledby="additional-options-heading" class="space-y-3">
		<Form.Field {form} name="showCopyButton">
			<Form.Control>
				{#snippet children({ props })}
					<div class="flex items-center space-x-2">
						<Switch
							{...props}
							{...$constraints.showCopyButton}
							bind:checked={$formData.showCopyButton}
							disabled={$submitting}
							aria-describedby={$errors.showCopyButton ? 'show-copy-button-error' : undefined}
							class={cn(
								$errors.showCopyButton && 'border-destructive focus-visible:ring-destructive/50'
							)}
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
					<div class="flex items-center space-x-2">
						<Switch
							{...props}
							{...$constraints.showDownloadButton}
							bind:checked={$formData.showDownloadButton}
							disabled={$submitting}
							aria-describedby={$errors.showDownloadButton
								? 'show-download-button-error'
								: undefined}
							class={cn(
								$errors.showDownloadButton && 'border-destructive focus-visible:ring-destructive/50'
							)}
						/>
						<Form.Label class="cursor-pointer">Show download button</Form.Label>
					</div>
				{/snippet}
			</Form.Control>
			<FormError errors={$errors.showDownloadButton} id="show-download-button-error" />
		</Form.Field>
	</div>
</div>
