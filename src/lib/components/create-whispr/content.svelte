<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
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

<Form.Field {form} name="content" class="flex h-full flex-col">
	<Form.Control>
		{#snippet children({ props })}
			<Textarea
				{...props}
				{...$constraints.content}
				bind:value={$formData.content}
				disabled={$submitting}
				class={cn(
					'min-h-96 flex-1 resize-none',
					$errors.content && 'border-destructive focus-visible:ring-destructive/50'
				)}
				placeholder="Enter your note here..."
				aria-describedby={$errors.content ? 'content-error' : undefined}
			/>
		{/snippet}
	</Form.Control>
	<FormError errors={$errors.content} id="content-error" />
</Form.Field>
