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
	import { getFullUrl } from '$lib/utils/seo.js';
	import { isError, tc, tca } from '@itsezz/try-catch';
	import Eraser from '@lucide/svelte/icons/eraser';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Send from '@lucide/svelte/icons/send';
	import SvelteSeo from 'svelte-seo';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { createSchema } from '../lib/schemas/create-schema';
	import type { PageProps } from './$types.js';

	// Props
	let { data }: PageProps = $props();

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
		validators: zod4Client(createSchema),
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
		},
		taintedMessage: () => {
			return new Promise(
				(resolve) => (openNavigateAwayDialog = { open: true, onConfirm: () => resolve(true) })
			);
		}
	});

	const { enhance, submitting, isTainted, tainted, allErrors } = form;

	let isFormDirty = $derived(isTainted($tainted) || password.length > 0);
	let isFormValid = $derived(
		$allErrors.length === 0 && (passwordOptionsComponent?.isValidPassword() ?? true)
	);

	// Handler Functions
	function handleClickOpenResetDialog() {
		openResetDialog = true;
	}

	function handleClickResetForm() {
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

		const pwd = tc(() => {
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

		const encryptedContent = await tca(aes.encrypt(content, pwd.data));
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

<SvelteSeo
	title="Create Whispr - Secure Message Sharing"
	description="Create encrypted messages with configurable expiration and view limits. Share sensitive information securely with password protection."
	keywords="create secure message, encrypted text, password protected message, configurable expiration, temporary sharing, secure communication"
	canonical={getFullUrl('/')}
	openGraph={{
		title: 'Create Whispr - Secure Message Sharing',
		description:
			'Create encrypted messages with configurable expiration and view limits. Share sensitive information securely with password protection.',
		url: getFullUrl('/'),
		type: 'website'
	}}
	twitter={{
		title: 'Create Whispr - Secure Message Sharing',
		description:
			'Create encrypted messages with configurable expiration and view limits. Share sensitive information securely with password protection.'
	}}
	jsonLd={{
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: 'Create Whispr',
		description:
			'Create encrypted messages with configurable expiration and view limits. Share sensitive information securely with password protection.',
		url: getFullUrl('/'),
		isPartOf: {
			'@type': 'WebSite',
			name: 'Whispr',
			url: getFullUrl('/')
		}
	}}
/>

<ConfirmReset bind:open={openResetDialog} onConfirm={handleClickResetForm} />

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
			<div class="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div class="flex flex-col lg:col-span-2">
					<Content {form} />
				</div>
				<div class="flex flex-col">
					<Options {form} bind:password {passwordOptionsComponent} />
					<div class="mt-4 flex w-full justify-end gap-2">
						<Button
							variant="destructive"
							onclick={handleClickOpenResetDialog}
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
			</div>
		</form>
	</div>
</div>
