<script lang="ts">
	import ConfirmNavigateAway from '$lib/components/common/confirm-navigate-away.svelte';
	import ConfirmReset from '$lib/components/common/confirm-reset.svelte';
	import Content from '$lib/components/create-whispr/content.svelte';
	import WhisprCreatedDialog from '$lib/components/create-whispr/created-dialog/whispr-created-dialog.svelte';
	import Options from '$lib/components/create-whispr/options.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import aes from '$lib/crypto/aes';
	import { passwordGenerator } from '$lib/crypto/pw-gen';
	import type { CreatedWhispr } from '$lib/types/created-whispr';
	import type { PasswordComponent } from '$lib/types/password';
	import { isError, tryCatch } from '$lib/utils/try-catch';
	import { Eraser, LoaderCircle, Send } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { type Infer, superForm, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { createSchema, type CreateSchema } from '../lib/schemas/create-schema';

	// Props
	interface Props {
		data: {
			form: SuperValidated<Infer<CreateSchema>>;
		};
	}
	let { data }: Props = $props();

	// Variables & States
	let openResetDialog = $state<boolean>(false);
	let createdWhispr = $state<CreatedWhispr | null>(null);
	let plainContent = $state<string>('');
	let openNavigateAwayDialog = $state<{
		open: boolean;
		onConfirm: () => void;
	}>({ open: false, onConfirm: () => {} });
	let password = $state<string>('');
	let randomPassword = $state<string | null>(null);
	let passwordOptionsComponent = $state<PasswordComponent>();

	const form = superForm(data.form, {
		validators: zodClient(createSchema),
		onSubmit: async ({ formData, cancel }) => {
			const originalContent = formData.get('content')?.toString();
			const content = await getEncryptedContent(originalContent);
			if (!content) {
				cancel();
				return;
			}
			formData.set('content', content);
			plainContent = originalContent ?? '';
		},
		onUpdate({ form, result }) {
			if (result.type !== 'success') {
				form.data.content = plainContent;
				if (result.data.error.title || result.data.error.description)
					toast.error(result.data.error.title, { description: result.data.error.description });
				return;
			}
			createdWhispr = result.data.response;
		},
		taintedMessage: () => {
			return new Promise(
				(resolve) => (openNavigateAwayDialog = { open: true, onConfirm: () => resolve(true) })
			);
		}
	});

	const {
		form: formData,
		capture,
		restore,
		enhance,
		submitting,
		isTainted,
		tainted,
		allErrors
	} = form;

	let isFormDirty = $derived(isTainted($tainted) || password.length > 0);
	let isFormValid = $derived(
		$allErrors.length === 0 && (passwordOptionsComponent?.isValidPassword() ?? true)
	);

	export const snapshot = { capture, restore };

	// Handler Functions
	function handleOpenResetDialog() {
		openResetDialog = true;
	}

	function handleResetForm() {
		form.reset();
		form.validateForm({ update: true });
		password = '';
		plainContent = '';
		randomPassword = null;
	}

	// Functions
	async function getEncryptedContent(content: string | undefined): Promise<string | null> {
		if (!content) {
			toast.error('Missing content', {
				description: 'Please enter the content you want to encrypt before creating a whispr.'
			});
			return null;
		}

		const pwd = await tryCatch(() => {
			if (password.length > 0) return password;
			randomPassword = passwordGenerator.generate(30);
			return randomPassword;
		});
		if (isError(pwd)) {
			toast.error('Encryption issue', {
				description:
					"We couldn't generate a secure password. Please try again or set your own password."
			});
			return null;
		}

		const encryptedContent = await tryCatch(aes.encrypt(content, pwd.data));
		if (isError(encryptedContent)) {
			toast.error('Encryption issue', {
				description: "We're having trouble encrypting your content. Please try again."
			});
			return null;
		}
		return encryptedContent.data;
	}

	function onOpenChangeWhisprCreatedDialog(open: boolean) {
		if (open === true) return;

		createdWhispr = null;
		form.reset();
		form.validateForm({ update: true });
		password = '';
		plainContent = '';
		randomPassword = null;
	}
</script>

<ConfirmReset bind:open={openResetDialog} onConfirm={handleResetForm} />

<ConfirmNavigateAway
	bind:open={openNavigateAwayDialog.open}
	onConfirm={openNavigateAwayDialog.onConfirm}
/>

<WhisprCreatedDialog
	{createdWhispr}
	onOpenChange={onOpenChangeWhisprCreatedDialog}
	{randomPassword}
/>

<div class="container mx-auto flex h-full flex-col overflow-hidden p-4">
	<h1 class="mb-4 px-1 text-2xl font-bold" id="page-title">Create Whispr</h1>
	<div class="flex-1 overflow-auto p-1">
		<form method="POST" use:enhance aria-labelledby="page-title">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div class="lg:col-span-2">
					<Content {form} {formData} />
				</div>
				<div>
					<Options {form} {formData} bind:password {passwordOptionsComponent} />
				</div>
				<div class="flex w-full justify-end gap-2 sm:col-span-2 lg:col-span-3">
					<Button
						variant="destructive"
						onclick={handleOpenResetDialog}
						disabled={!isFormDirty || $submitting}
						aria-label="Reset form"
					>
						Reset<Eraser aria-hidden="true" />
					</Button>
					<Form.Button
						disabled={$submitting || !isFormValid}
						aria-label={$submitting ? 'Creating whispr...' : 'Create whispr'}
					>
						Create whispr
						{#if $submitting}
							<LoaderCircle class="animate-spin" aria-hidden="true" role="status" />
							<span class="sr-only">Creating whispr...</span>
						{:else}
							<Send aria-hidden="true" />
						{/if}
					</Form.Button>
				</div>
			</div>
		</form>
	</div>
</div>
