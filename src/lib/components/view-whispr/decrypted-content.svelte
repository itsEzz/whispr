<script lang="ts">
	import CopyButton from '$lib/components/common/copy-button.svelte';
	import PopoverBadge from '$lib/components/common/popover-badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { ViewWhispr } from '$lib/types/view-whispr';
	import { copyText } from '$lib/utils/copy';
	import { formatDate, getUserLocale } from '$lib/utils/date-helpers';
	import { downloadFile } from '$lib/utils/download';
	import CalendarX from '@lucide/svelte/icons/calendar-x';
	import Download from '@lucide/svelte/icons/download';
	import Eye from '@lucide/svelte/icons/eye';

	// Props
	interface Props {
		whispr: ViewWhispr;
		content: string;
		disabled?: boolean;
	}

	let { whispr, content, disabled = false }: Props = $props();

	// Variables & States
	let showFooter = $derived(
		whispr.views !== undefined ||
			whispr.unlimitedViews ||
			whispr.expiresAt ||
			whispr.showCopyButton ||
			whispr.showDownloadButton
	);
	let formattedExpirationDate = $derived.by(() => {
		if (!whispr.expiresAt) return '';

		const expirationDate = formatDate(new Date(whispr.expiresAt), getUserLocale(), {
			dateStyle: 'long',
			timeStyle: 'short',
			hour12: false
		});

		return expirationDate;
	});

	// Handler Functions
	async function handleClickCopyContent(): Promise<boolean> {
		return await copyText(content);
	}

	function handleClickDownloadContent() {
		downloadFile(content, `whispr-${whispr.id}.txt`);
	}
</script>

<h1 class="mb-4 px-1 text-2xl font-bold">Whispr Content</h1>

<div
	class="border-input dark:bg-input/30 focus-within:border-ring focus-within:ring-ring/50 relative mb-0 flex min-h-0 flex-1 flex-col rounded-lg border bg-transparent shadow-xs transition-[color,box-shadow] focus-within:ring-[3px]"
>
	<Textarea
		readonly
		value={content}
		class="flex-1 resize-none rounded-b-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
		placeholder="Decrypted content will appear here..."
		aria-label="Decrypted whispr content"
	/>
	{#if showFooter}
		<div
			class="dark:bg-input/30 flex flex-col items-center gap-2 border-t bg-transparent p-3 sm:flex-row"
		>
			<div class="flex flex-wrap items-center justify-center gap-2">
				{#if whispr.unlimitedViews || whispr.views !== undefined}
					<PopoverBadge variant="outline" id="views-badge" {disabled}>
						{#snippet content()}
							<Eye size={16} aria-hidden="true" />
							{#if whispr.unlimitedViews === true}
								Unlimited views
							{:else}
								<span>{whispr.views} {whispr.views === 1 ? 'view' : 'views'}</span>
							{/if}
						{/snippet}
						{#snippet popoverContent()}
							<p class="text-foreground/90 text-sm">
								{#if whispr.unlimitedViews === true}
									Can be viewed unlimited more times
								{:else}
									Can be viewed {whispr.views} more {whispr.views === 1 ? 'time' : 'times'}
								{/if}
							</p>
						{/snippet}
					</PopoverBadge>
				{/if}
				{#if whispr.expiresAt}
					<PopoverBadge variant="outline" id="expiration-badge" {disabled}>
						{#snippet content()}
							<CalendarX size={16} aria-hidden="true" />
							<span>{formattedExpirationDate}</span>
						{/snippet}
						{#snippet popoverContent()}
							<p class="text-foreground/90 text-sm">
								Expires on {formattedExpirationDate}
							</p>
						{/snippet}
					</PopoverBadge>
				{/if}
			</div>
			{#if whispr.showCopyButton || whispr.showDownloadButton}
				<div class="flex flex-wrap items-center justify-center gap-2 sm:ml-auto">
					{#if whispr.showCopyButton}
						<CopyButton
							size="sm"
							text="Copy"
							copySuccessText="Copied"
							copyFailedText="Copy failed"
							copyFn={handleClickCopyContent}
							aria-label="Copy whispr content to clipboard"
							{disabled}
						/>
					{/if}

					{#if whispr.showDownloadButton}
						<Button
							size="sm"
							onclick={handleClickDownloadContent}
							aria-label="Download whispr content as text file"
							{disabled}
						>
							Download
							<Download aria-hidden="true" />
						</Button>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
