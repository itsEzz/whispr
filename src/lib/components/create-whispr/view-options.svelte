<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import { cn } from '$lib/utils';
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
	const { form: formData, errors, constraints, submitting } = form;

	// Functions
	function onUnlimitedViewsChange(checked: boolean) {
		if (checked && $errors.views) $formData.views = 1;
	}
</script>

<div class="space-y-3 px-4">
	<Form.Field {form} name="views">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Views</Form.Label>
				{#if $formData.unlimitedViews}
					<Input
						type="text"
						value="Unlimited"
						class="text-muted-foreground"
						disabled
						aria-label="Unlimited views selected"
					/>
				{/if}
				<Input
					{...props}
					{...$constraints.views}
					bind:value={$formData.views}
					disabled={$submitting || disabled}
					type="number"
					placeholder="Number of allowed views"
					aria-describedby={$errors.views ? 'views-error' : undefined}
					class={cn($formData.unlimitedViews && 'hidden')}
				/>
			{/snippet}
		</Form.Control>
		<FormError errors={$errors.views} id="views-error" />
	</Form.Field>
	<Form.Field {form} name="showViews">
		<Form.Control>
			{#snippet children({ props })}
				<div class="flex items-center space-x-2">
					<Switch
						{...props}
						{...$constraints.showViews}
						bind:checked={$formData.showViews}
						disabled={$submitting || disabled}
						aria-describedby={$errors.showViews ? 'show-views-error' : undefined}
					/>
					<Form.Label class="cursor-pointer">Show remaining views to recipients</Form.Label>
				</div>
			{/snippet}
		</Form.Control>
		<FormError errors={$errors.showViews} id="show-views-error" />
	</Form.Field>
	<Form.Field {form} name="unlimitedViews">
		<Form.Control>
			{#snippet children({ props })}
				<div class="flex items-center space-x-2">
					<Switch
						{...props}
						{...$constraints.unlimitedViews}
						bind:checked={$formData.unlimitedViews}
						disabled={$submitting || disabled}
						aria-describedby={$errors.unlimitedViews ? 'unlimited-views-error' : undefined}
						onCheckedChange={onUnlimitedViewsChange}
					/>
					<Form.Label class="cursor-pointer">Unlimited views</Form.Label>
				</div>
			{/snippet}
		</Form.Control>
		<FormError errors={$errors.unlimitedViews} id="unlimited-views-error" />
	</Form.Field>
</div>
