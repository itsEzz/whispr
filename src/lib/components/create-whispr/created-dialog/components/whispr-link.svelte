<script lang="ts">
	import CopyButton from '$lib/components/common/copy-button.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { CreatedWhispr } from '$lib/types/created-whispr';
	import { copyText, isCopySupported } from '$lib/utils/copy';
	import { isShareSupported, shareText } from '$lib/utils/share';
	import { Share2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// Props
	interface Props {
		createdWhispr: CreatedWhispr | null;
		whisprUrl: string;
	}

	let { createdWhispr, whisprUrl }: Props = $props();

	// Variables & States
	let isInvalidLink = $derived(createdWhispr === null);
	let inputValue = $derived(isInvalidLink ? 'Something went wrong...' : whisprUrl);

	// Handler Functions
	async function handleClickCopyWhisprUrl(): Promise<boolean> {
		if (createdWhispr === null) return false;

		const copied = await copyText(whisprUrl);
		if (!copied) {
			toast.error('Whispr link copy failed', {
				description: "We're having trouble copying to clipboard. Try copying the link manually."
			});
			return false;
		}
		toast.success('Whispr link copied', {
			description: 'The whispr link is now in your clipboard.'
		});
		return true;
	}

	async function handleClickShareWhisprUrl() {
		if (createdWhispr === null) return;

		const ok = await shareText('Whispr', 'Check out this shared whispr!', whisprUrl);
		if (!ok) {
			toast.error('Share failed', {
				description: "We're having trouble sharing the link. Try copying the link manually."
			});
		}
	}

	function handleClickWhisprLink(
		event: MouseEvent & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		event.currentTarget.select();
	}
</script>

<div class="mt-4 space-y-2">
	<Input
		type="text"
		id="whispr-link"
		placeholder="Your whispr link will appear here..."
		aria-label="Whispr link"
		class="focus-visible:ring-0 focus-visible:ring-offset-0"
		readonly
		value={inputValue}
		aria-invalid={isInvalidLink}
		aria-describedby={isInvalidLink ? 'whispr-link-error' : undefined}
		onclick={handleClickWhisprLink}
	/>

	<div class="flex justify-center gap-2">
		{#if isCopySupported()}
			<CopyButton
				id="copy-whispr-link"
				text="Copy link"
				copySuccessText="Link copied"
				copyFailedText="Copy failed"
				copyFn={handleClickCopyWhisprUrl}
				disabled={isInvalidLink}
				aria-label="Copy whispr link to clipboard"
			/>
		{/if}
		{#if isShareSupported()}
			<Button
				onclick={handleClickShareWhisprUrl}
				disabled={isInvalidLink}
				aria-label="Share whispr link"
			>
				Share link <Share2 aria-hidden="true" />
			</Button>
		{/if}
	</div>
</div>
