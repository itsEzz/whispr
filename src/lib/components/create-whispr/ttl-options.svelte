<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Switch } from '$lib/components/ui/switch';
	import type { TtlPreset } from '$lib/types/ttl';
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
	const ttlPresets: TtlPreset[] = [
		{ label: '1 hour', value: 1, unit: 'hours' },
		{ label: '1 day', value: 1, unit: 'days' },
		{ label: '1 week', value: 7, unit: 'days' },
		{ label: '1 month', value: 30, unit: 'days' }
	];

	// Handler Functions
	function handleClickTtlPreset(preset: TtlPreset) {
		$formData.ttlValue = preset.value;
		$formData.ttlUnit = preset.unit;
	}
</script>

<div class="space-y-3 px-4">
	<Form.Field {form} name="ttlValue">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Expires in</Form.Label>
				<div class="mb-3 flex flex-wrap gap-2" role="group" aria-label="Time expiration presets">
					{#each ttlPresets as preset}
						<Button
							variant={$formData.ttlValue === preset.value && $formData.ttlUnit === preset.unit
								? 'default'
								: 'secondary'}
							size="sm"
							onclick={() => handleClickTtlPreset(preset)}
							class="min-w-[calc(50%-0.25rem)] flex-1 sm:min-w-[calc(25%-0.375rem)]"
							disabled={$submitting}
							aria-pressed={$formData.ttlValue === preset.value &&
								$formData.ttlUnit === preset.unit}
						>
							{preset.label}
						</Button>
					{/each}
				</div>
				<div
					class={cn(
						'flex items-stretch overflow-hidden rounded-md border border-input ring-offset-2 ring-offset-background focus-within:ring-2 ',
						$errors.ttlValue || $errors.ttlUnit
							? 'border-destructive focus-within:ring-destructive/50'
							: 'focus-within:ring-ring'
					)}
					role="group"
					aria-labelledby="ttl-custom-label"
				>
					<span id="ttl-custom-label" class="sr-only">Custom expiration time</span>
					<Input
						{...props}
						{...$constraints.ttlValue}
						bind:value={$formData.ttlValue}
						disabled={$submitting}
						type="number"
						aria-describedby={$errors.ttlValue ? 'ttl-value-error' : undefined}
						class="h-10 w-full rounded-none border-0 bg-transparent px-3 text-foreground focus-visible:ring-0"
					/>
					<div class="relative my-1.5 w-px" aria-hidden="true">
						<div class="absolute inset-0 bg-input"></div>
					</div>
					<Form.Field {form} name="ttlUnit">
						<Form.Control>
							{#snippet children({ props })}
								<Select.Root
									{...props}
									{...$constraints.ttlUnit}
									bind:value={$formData.ttlUnit}
									disabled={$submitting}
									type="single"
								>
									<Select.Trigger
										class="w-28 rounded-none border-0 bg-transparent px-3 focus:ring-0"
										aria-label="Time unit"
									>
										{$formData.ttlUnit.charAt(0).toUpperCase() +
											$formData.ttlUnit.slice(1, $formData.ttlValue === 1 ? -1 : undefined)}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="minutes">
											Minute{$formData.ttlValue === 1 ? '' : 's'}
										</Select.Item>
										<Select.Item value="hours">
											Hour{$formData.ttlValue === 1 ? '' : 's'}
										</Select.Item>
										<Select.Item value="days">Day{$formData.ttlValue === 1 ? '' : 's'}</Select.Item>
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
					</Form.Field>
				</div>
			{/snippet}
		</Form.Control>
		<FormError
			errors={[...($errors.ttlValue ?? []), ...($errors.ttlUnit ?? [])]}
			id="ttl-value-error"
		/>
	</Form.Field>
	<Form.Field {form} name="showTtl">
		<Form.Control>
			{#snippet children({ props })}
				<div class="flex items-center space-x-2">
					<Switch
						{...props}
						{...$constraints.showTtl}
						bind:checked={$formData.showTtl}
						disabled={$submitting}
						aria-describedby={$errors.showTtl ? 'show-ttl-error' : undefined}
						class={cn($errors.showTtl && 'border-destructive focus-visible:ring-destructive/50')}
					/>
					<Form.Label class="cursor-pointer">Show expiration date to recipients</Form.Label>
				</div>
			{/snippet}
		</Form.Control>
		<FormError errors={$errors.showTtl} id="show-ttl-error" />
	</Form.Field>
</div>
