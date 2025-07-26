<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { cn } from '$lib/utils';
	import { clientAppConfig } from '$lib/utils/client-app-config';
	import { getAcceptAttribute, validateTextFile } from '$lib/utils/file-validation';
	import Text from '@lucide/svelte/icons/text';
	import Upload from '@lucide/svelte/icons/upload';
	import { toast } from 'svelte-sonner';
	import type { Infer } from 'sveltekit-superforms';
	import type { SuperForm } from 'sveltekit-superforms/client';
	import type { CreateSchema } from '../../schemas/create-schema';
	import FormError from '../common/form-error.svelte';
	import PopoverBadge from '../common/popover-badge.svelte';

	// Props
	interface Props {
		form: SuperForm<Infer<CreateSchema>>;
	}

	let { form }: Props = $props();

	// Variables & States
	let fileInput: HTMLInputElement;
	const { form: formData, errors, constraints, submitting } = form;
	const readableLength = $derived(getReadableContentLength($formData.content.length));
	const minLength = clientAppConfig.PUBLIC_CONTENT_MIN_LENGTH;
	const maxLength = clientAppConfig.PUBLIC_CONTENT_MAX_LENGTH;

	// Handler Functions
	function handleClickFileUpload() {
		fileInput.click();
	}

	async function handleOnChangeFile(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			toast.error('File too large', {
				description: 'Please select a file smaller than 10MB.'
			});
			target.value = '';
			return;
		}

		const validation = await validateTextFile(file);
		if (!validation.isValid) {
			toast.error('Invalid file type', {
				description: validation.reason || 'Please select a text file.'
			});
			target.value = '';
			return;
		}

		const reader = new FileReader();

		reader.onload = (e) => {
			const content = e.target?.result as string;
			if (content) {
				$formData.content = content;
				toast.success('File uploaded successfully', {
					description: `'${file.name}' has been loaded into the editor.`
				});
			}
		};

		reader.onerror = () => {
			toast.error('Upload failed', {
				description: 'There was an error reading the file. Please try again.'
			});
		};
		reader.readAsText(file);

		target.value = '';
	}

	// Functions
	function getReadableContentLength(length: number): string {
		if (length < 1000) {
			return length.toString();
		} else if (length < 1000000) {
			return (length / 1000).toFixed(1) + 'k';
		} else {
			return (length / 1000000).toFixed(1) + 'M';
		}
	}
</script>

<input
	disabled={$submitting}
	type="file"
	accept={getAcceptAttribute()}
	class="hidden"
	bind:this={fileInput}
	onchange={handleOnChangeFile}
	aria-label="Upload text file"
/>
<Form.Field {form} name="content" class="flex h-full min-h-0 flex-col">
	<Form.Control>
		{#snippet children({ props })}
			<Form.Label class="sr-only">Content</Form.Label>
			<div
				class={cn(
					'border-input dark:bg-input/30 relative mb-0 flex min-h-0 grow flex-col overflow-hidden rounded-lg border bg-transparent shadow-xs transition-[color,box-shadow] focus-within:ring-[3px] sm:max-h-full',
					$errors.content
						? 'border-destructive ring-destructive/20 dark:ring-destructive/40'
						: 'focus-within:border-ring focus-within:ring-ring/50'
				)}
			>
				<Textarea
					{...props}
					{...$constraints.content}
					bind:value={$formData.content}
					disabled={$submitting}
					class={cn(
						'max-h-96 min-h-96 flex-1 resize-none rounded-b-none border-none shadow-none focus-visible:ring-0 sm:max-h-full'
					)}
					placeholder="Enter your message here or upload a file..."
					aria-label="Content to encrypt"
					aria-describedby={$errors.content ? 'content-error' : undefined}
				/>
				<div class="dark:bg-input/30 flex flex-shrink-0 items-center border-t bg-transparent p-3">
					<Button
						size="sm"
						variant="ghost"
						disabled={$submitting}
						onclick={handleClickFileUpload}
						type="button"
						class="text-muted-foreground hover:text-foreground gap-2"
						aria-label="Upload text file"
					>
						Upload File
						<Upload />
					</Button>
					<div class="ml-auto gap-1.5">
						<PopoverBadge variant="outline" id="views-badge">
							{#snippet content()}
								<Text size={16} aria-hidden="true" />
								{readableLength} character{$formData.content.length !== 1 ? 's' : ''}
							{/snippet}
							{#snippet popoverContent()}
								<div class="min-w-48 space-y-2">
									<div class="bg-muted h-2 w-full overflow-hidden rounded-full">
										<div
											class={cn(
												'h-full transition-all duration-300 ease-out',
												$formData.content.length >= maxLength
													? 'bg-destructive'
													: $formData.content.length > maxLength * 0.9
														? 'text-yellow-600 dark:text-yellow-500'
														: 'bg-primary'
											)}
											style="width: {Math.min(($formData.content.length / maxLength) * 100, 100)}%"
										></div>
									</div>
									<div class="text-muted-foreground flex justify-between text-xs">
										<span>Min: {getReadableContentLength(minLength)}</span>
										<span>Max: {getReadableContentLength(maxLength)}</span>
									</div>
								</div>
							{/snippet}
						</PopoverBadge>
					</div>
				</div>
			</div>
		{/snippet}
	</Form.Control>
	<FormError errors={$errors.content} id="content-error" />
</Form.Field>
