<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
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

	// Functions
	function onUnlimitedViewsChange(checked: boolean) {
		if (checked && $errors.views) $formData.views = 1;
	}
</script>

<div class="space-y-3 px-4">
	<Form.Field {form} name="views">
		<Form.Control>
			{#snippet children({ props }: { props: any })}
				<Form.Label>Views</Form.Label>
				{#if $formData.unlimitedViews}
					<Input
						type="text"
						value="Unlimited"
						class="text-muted-foreground"
						disabled
						aria-label="Unlimited views"
					/>
				{/if}
				<Input
					{...props}
					{...$constraints.views}
					bind:value={$formData.views}
					disabled={$submitting}
					type="number"
					aria-invalid={$errors.views ? 'true' : undefined}
					aria-describedby={$errors.views ? 'views-error' : undefined}
					class={cn(
						$errors.views && 'border-destructive focus-visible:ring-destructive/50',
						$formData.unlimitedViews && 'hidden'
					)}
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
						disabled={$submitting}
						aria-invalid={$errors.showViews ? 'true' : undefined}
						aria-describedby={$errors.showViews ? 'show-views-error' : undefined}
						class={cn($errors.showViews && 'border-destructive focus-visible:ring-destructive/50')}
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
						disabled={$submitting}
						aria-invalid={$errors.unlimitedViews ? 'true' : undefined}
						aria-describedby={$errors.unlimitedViews ? 'unlimited-views-error' : undefined}
						class={cn(
							$errors.unlimitedViews && 'border-destructive focus-visible:ring-destructive/50'
						)}
						onCheckedChange={onUnlimitedViewsChange}
					/>
					<Form.Label class="cursor-pointer">Unlimited views</Form.Label>
				</div>
			{/snippet}
		</Form.Control>
		<FormError errors={$errors.unlimitedViews} id="unlimited-views-error" />
	</Form.Field>
</div>
