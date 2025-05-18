<script lang="ts">
	import PopoverBadge from '$lib/components/common/popover-badge.svelte';
	import type { CreatedWhispr } from '$lib/types/created-whispr';
	import { formatDate, getUserLocale } from '$lib/utils/date-helpers';
	import { CalendarX, Copy, Download, Eye } from 'lucide-svelte';
	import { MediaQuery } from 'svelte/reactivity';

	// Props
	interface Props {
		createdWhispr: CreatedWhispr | null;
	}

	let { createdWhispr }: Props = $props();

	// Variables & States
	const isDesktop = new MediaQuery('(min-width: 768px)');
	let viewsText = $derived.by(() => {
		if (createdWhispr?.unlimitedViews === true) return 'Can be viewed unlimited times';
		else
			return `Can be viewed ${createdWhispr?.views} ${createdWhispr?.views === 1 ? 'time' : 'times'}`;
	});

	let viewsVisibilityText = $derived.by(() => {
		if (createdWhispr?.showViews) return 'Remaining views visible to recipients';
		else return 'Remaining views hidden from recipients';
	});

	let formattedExpirationDate = $derived.by(() => {
		if (!createdWhispr?.expiresAt) return '';

		const expirationDate = formatDate(new Date(createdWhispr.expiresAt), getUserLocale(), {
			dateStyle: 'long',
			timeStyle: 'short',
			hour12: false
		});

		return expirationDate;
	});

	let formattedLongExpirationDate = $derived.by(() => {
		if (!createdWhispr?.expiresAt) return '';

		const expirationDate = formatDate(new Date(createdWhispr.expiresAt), getUserLocale(), {
			dateStyle: 'long',
			timeStyle: 'short',
			hour12: false
		});

		return `Expires on ${expirationDate}`;
	});

	let expirationVisibilityText = $derived.by(() => {
		if (createdWhispr?.showExpiresAt) return 'Expiration date visible to recipients';
		else return 'Expiration date hidden from recipients';
	});

	let copyButtonVisibilityText = $derived.by(() => {
		if (createdWhispr?.showViews) return 'Copy whispr button visible to recipients';
		else return 'Copy whispr button hidden from recipients';
	});

	let downloadButtonVisibilityText = $derived.by(() => {
		if (createdWhispr?.showViews) return 'Download button visible to recipients';
		else return 'Download button hidden from recipients';
	});
</script>

{#if createdWhispr}
	<section aria-labelledby="whispr-overview-title">
		<h2 id="whispr-overview-title" class="sr-only">Whispr settings overview</h2>

		{#if isDesktop.current}
			<div class="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4" role="list">
				<div class="grid gap-4">
					<div class="space-y-2" role="listitem">
						<div class="flex items-center gap-2">
							<Eye class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
							<h3 class="text-md font-medium">Views</h3>
						</div>
						<div class="space-y-1">
							<p class="text-sm text-foreground/90">
								{viewsText}
							</p>
							<p class="text-xs text-muted-foreground">
								{viewsVisibilityText}
							</p>
						</div>
					</div>
					<div class="space-y-2" role="listitem">
						<div class="flex items-center gap-2">
							<Copy class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
							<h3 class="text-md font-medium">Copy Button</h3>
						</div>
						<div class="space-y-1">
							<p class="text-sm text-foreground/90">
								{copyButtonVisibilityText}
							</p>
						</div>
					</div>
				</div>
				<div class="grid gap-4">
					<div class="space-y-2" role="listitem">
						<div class="flex items-center gap-2">
							<CalendarX class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
							<h3 class="text-md font-medium">Expiration</h3>
						</div>
						<div class="space-y-1">
							<p class="text-sm text-foreground/90">
								{formattedLongExpirationDate}
							</p>
							<p class="text-xs text-muted-foreground">
								{expirationVisibilityText}
							</p>
						</div>
					</div>
					<div class="space-y-2" role="listitem">
						<div class="flex items-center gap-2">
							<Download class="h-5 w-5 text-muted-foreground" aria-hidden="true" />
							<h3 class="text-md font-medium">Download Button</h3>
						</div>
						<div class="space-y-1">
							<p class="text-sm text-foreground/90">
								{downloadButtonVisibilityText}
							</p>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<div class="flex flex-wrap gap-2" role="list">
				<PopoverBadge variant="secondary" label="View whispr view settings" id="views-badge">
					{#snippet content()}
						<Eye class="mr-2 h-4 w-4" aria-hidden="true" />
						{#if createdWhispr.unlimitedViews === true}
							Unlimited
						{:else}
							{createdWhispr.views} {createdWhispr.views === 1 ? 'view' : 'views'}
						{/if}
					{/snippet}
					{#snippet popoverContent()}
						<div class="space-y-0.5 text-sm">
							<p class="text-foreground/90">
								{viewsText}
							</p>
							<p class="text-xs text-muted-foreground">
								{viewsVisibilityText}
							</p>
						</div>
					{/snippet}
				</PopoverBadge>
				<PopoverBadge
					variant="secondary"
					label="View whispr expiration settings"
					id="expiration-badge"
				>
					{#snippet content()}
						<CalendarX class="mr-2 h-4 w-4" aria-hidden="true" />
						{formattedExpirationDate}
					{/snippet}
					{#snippet popoverContent()}
						<div class="space-y-0.5 text-sm">
							<p class="text-foreground/90">
								{formattedLongExpirationDate}
							</p>
							<p class="text-xs text-muted-foreground">
								{expirationVisibilityText}
							</p>
						</div>
					{/snippet}
				</PopoverBadge>
				<PopoverBadge variant="secondary" label="View whispr copy button settings" id="copy-badge">
					{#snippet content()}
						<Copy class="mr-2 h-4 w-4" aria-hidden="true" />
						{#if createdWhispr.showCopyButton}
							Visible
						{:else}
							Hidden
						{/if}
					{/snippet}
					{#snippet popoverContent()}
						<p class="text-sm text-foreground/90">
							{copyButtonVisibilityText}
						</p>
					{/snippet}
				</PopoverBadge>
				<PopoverBadge
					variant="secondary"
					label="View whispr download button settings"
					id="download-badge"
				>
					{#snippet content()}
						<Download class="mr-2 h-4 w-4" aria-hidden="true" />
						{#if createdWhispr.showDownloadButton}
							Visible
						{:else}
							Hidden
						{/if}
					{/snippet}
					{#snippet popoverContent()}
						<p class="break-words text-sm text-foreground/90">
							{downloadButtonVisibilityText}
						</p>
					{/snippet}
				</PopoverBadge>
			</div>
		{/if}
	</section>
{/if}
