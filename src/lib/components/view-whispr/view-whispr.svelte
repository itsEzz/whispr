<script lang="ts">
	import aes from '$lib/crypto/aes';
	import { viewPasswordSchema } from '$lib/schemas/view-schema';
	import type { ViewWhispr } from '$lib/types/view-whispr';
	import { isError, tc, tca } from '@itsezz/try-catch';
	import { Base64 } from 'js-base64';
	import { onMount, tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { defaults, setError, superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import ConfirmNavigateAway from '../common/confirm-navigate-away.svelte';
	import DecryptWhispr from './decrypt-whispr.svelte';
	import DecryptedContent from './decrypted-content.svelte';

	// Props
	interface Props {
		whispr: ViewWhispr;
		encodedUrlPassword?: string;
	}

	let { whispr, encodedUrlPassword }: Props = $props();

	// Variables & States
	let loading = $state<boolean>(true);
	let openNavigateAwayDialog = $state<{
		open: boolean;
		onConfirm: () => void;
	}>({ open: false, onConfirm: () => {} });
	let decryptedContent: string | null = $state<string | null>(null);

	const form = superForm(defaults(zod4(viewPasswordSchema)), {
		SPA: true,
		validators: zod4(viewPasswordSchema),
		onUpdate: async ({ form }) => {
			if (!form.valid) return;
			const decryptionResult = await tca(aes.decrypt(whispr.content, form.data.password));

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
			const decodingResult = tc(() => Base64.decode(encodedUrlPassword));

			if (isError(decodingResult)) {
				toast.error('Invalid link', {
					description: 'Password could not be decoded. Please enter it manually.'
				});
				loading = false;
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
