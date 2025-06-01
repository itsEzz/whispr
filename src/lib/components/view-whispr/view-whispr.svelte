<script lang="ts">
	import aes from '$lib/crypto/aes';
	import { viewPasswordSchema, type ViewPasswordSchema } from '$lib/schemas/view-schema';
	import type { ViewWhispr } from '$lib/types/view-whispr';
	import { isError, tryCatch } from '@itsezz/try-catch';
	import { Base64 } from 'js-base64';
	import { onMount, tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { setError, superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import ConfirmNavigateAway from '../common/confirm-navigate-away.svelte';
	import DecryptWhispr from './decrypt-whispr.svelte';
	import DecryptedContent from './decrypted-content.svelte';

	// Props
	interface Props {
		form: SuperValidated<Infer<ViewPasswordSchema>>;
		whispr: ViewWhispr;
		encodedUrlPassword?: string;
	}

	let { form: rawForm, whispr, encodedUrlPassword }: Props = $props();

	// Variables & States
	let loading = $state<boolean>(true);
	let openNavigateAwayDialog = $state<{
		open: boolean;
		onConfirm: () => void;
	}>({ open: false, onConfirm: () => {} });
	let decryptedContent: string | null = $state<string | null>(null);

	const form = superForm(rawForm, {
		SPA: true,
		validators: zod(viewPasswordSchema),
		onUpdate: async ({ form }) => {
			if (!form.valid) return;
			const decryptionResult = await tryCatch(aes.decrypt(whispr.content, form.data.password));

			if (isError(decryptionResult)) {
				setError(form, 'password', 'Invalid password');
				return;
			}
			decryptedContent = decryptionResult.data;
		},
		taintedMessage: () => {
			return new Promise(
				(resolve) => (openNavigateAwayDialog = { open: true, onConfirm: () => resolve(true) })
			);
		}
	});

	const { form: formData, submit } = form;

	onMount(async () => {
		if (encodedUrlPassword) {
			const decodingResult = tryCatch(() => Base64.decode(encodedUrlPassword));

			if (isError(decodingResult)) {
				toast.error('Invalid link', {
					description: 'Password could not be decoded. Please enter it manually.'
				});
				return;
			}

			$formData.password = decodingResult.data;
			await tick();
			submit();
		}
		loading = false;
	});
</script>

<ConfirmNavigateAway
	bind:open={openNavigateAwayDialog.open}
	onConfirm={openNavigateAwayDialog.onConfirm}
/>

{#if !decryptedContent}
	<DecryptWhispr {form} {loading} />
{:else}
	<DecryptedContent {whispr} content={decryptedContent} />
{/if}
