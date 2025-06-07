<script lang="ts">
	import CopyButton from '$lib/components/common/copy-button.svelte';
	import PopoverBadge from '$lib/components/common/popover-badge.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { ViewWhispr } from '$lib/types/view-whispr';
	import { copyText } from '$lib/utils/copy';
	import { formatDate, getUserLocale } from '$lib/utils/date-helpers';
	import { downloadFile } from '$lib/utils/download';
	import { CalendarX, Download, Eye } from '@lucide/svelte';

	// Props
	interface Props {
		whispr: ViewWhispr;
		content: string;
	}

	let { whispr, content }: Props = $props();

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

<div class="container mx-auto flex h-full flex-col overflow-hidden p-4">
	<h1 class="mb-4 px-1 text-2xl font-bold">Whispr Content</h1>
	<div class="flex-1 overflow-auto p-1">
		<div class="flex h-full flex-col gap-4">
			<div class="bg-background relative flex grow flex-col overflow-hidden rounded-lg border">
				<Textarea
					readonly
					value={content}
					class="h-full resize-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
					placeholder="Decrypted content will appear here..."
					aria-label="Decrypted whispr content"
				/>
				{#if showFooter}
					<div class="flex flex-col items-center gap-2 p-3 sm:flex-row">
						<div class="flex flex-wrap items-center justify-center gap-2">
							{#if whispr.unlimitedViews || whispr.views !== undefined}
								<PopoverBadge variant="outline" id="views-badge">
									{#snippet content()}
										<Eye class="mr-2 h-4 w-4" aria-hidden="true" />
										{#if whispr.unlimitedViews === true}
											Unlimtied views
										{:else}
											{whispr.views} 10
											{whispr.views === 1 ? 'view' : 'views'}
										{/if}
									{/snippet}
									{#snippet popoverContent()}
										<p class="text-foreground/90 text-sm">
											{#if whispr.unlimitedViews === true}
												Can be viewed unlimited times
											{:else}
												Can be viewed ${whispr.views} ${whispr.views === 1 ? 'time' : 'times'}
											{/if}
										</p>
									{/snippet}
								</PopoverBadge>
							{/if}
							{#if whispr.expiresAt}
								<PopoverBadge variant="outline" id="expires-at-badge">
									{#snippet content()}
										<CalendarX class="mr-2 h-4 w-4" aria-hidden="true" />
										{formattedExpirationDate}
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
									/>
								{/if}

								{#if whispr.showDownloadButton}
									<Button
										size="sm"
										onclick={handleClickDownloadContent}
										aria-label="Download whispr content as text file"
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
		</div>
	</div>
</div>
