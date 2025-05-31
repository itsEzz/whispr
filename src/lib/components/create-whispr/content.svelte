<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { cn } from '$lib/utils';
	import { getAcceptAttribute, validateTextFile } from '$lib/utils/file-validation';
	import { Upload } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { Infer } from 'sveltekit-superforms';
	import type { SuperForm } from 'sveltekit-superforms/client';
	import type { CreateSchema } from '../../schemas/create-schema';
	import FormError from '../common/form-error.svelte';

	// Props
	interface Props {
		form: SuperForm<Infer<CreateSchema>>;
	}

	let { form }: Props = $props();

	// Variables & States
	let fileInput: HTMLInputElement;
	const { form: formData, errors, constraints, submitting } = form;

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

		// Reset the input so the same file can be selected again
		target.value = '';
	}

	// Functions
	function handleGetReadableContentLength(length: number): string {
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

<Form.Field {form} name="content" class="flex h-full flex-col">
	<Form.Control>
		{#snippet children({ props })}
			<div
				class={cn(
					'relative flex flex-grow flex-col overflow-hidden rounded-lg border bg-background ring-offset-2 ring-offset-background focus-within:ring-2',
					$errors.content
						? 'border-destructive focus-within:ring-destructive/50 '
						: 'focus-within:ring-ring'
				)}
			>
				<Textarea
					{...props}
					{...$constraints.content}
					bind:value={$formData.content}
					disabled={$submitting}
					class={cn(
						'min-h-96 flex-1 resize-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
					)}
					placeholder="Enter your note here or upload a file..."
					aria-describedby={$errors.content ? 'content-error' : undefined}
				/>
				<div
					class={cn('flex items-center border-t p-3', $errors.content ? 'border-destructive' : '')}
				>
					<Button
						size="sm"
						variant="ghost"
						disabled={$submitting}
						onclick={handleClickFileUpload}
						type="button"
						class="gap-2 text-muted-foreground hover:text-foreground"
						aria-label="Upload text file"
					>
						<Upload class="size-4" />
						Upload File
					</Button>
					<div class="ml-auto gap-1.5">
						<Badge variant="outline" aria-label="Content length">
							{handleGetReadableContentLength($formData.content.length)} character{$formData.content
								.length !== 1
								? 's'
								: ''}
							<span class="sr-only">
								{handleGetReadableContentLength($formData.content.length)} character{$formData
									.content.length !== 1
									? 's'
									: ''}
							</span>
						</Badge>
					</div>
				</div>
			</div>
		{/snippet}
	</Form.Control>
	<FormError errors={$errors.content} id="content-error" />
</Form.Field>
