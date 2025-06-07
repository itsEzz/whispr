<script lang="ts">
	import PopoverBadge from '$lib/components/common/popover-badge.svelte';
	import type { CreatedWhispr } from '$lib/types/created-whispr';
	import { formatDate, getUserLocale } from '$lib/utils/date-helpers';
	import { CalendarX, Copy, Download, Eye } from '@lucide/svelte';
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
			<div class="bg-muted grid grid-cols-2 gap-4 rounded-lg p-4" role="list">
				<div class="grid gap-4">
					<div class="space-y-2" role="listitem">
						<div class="flex items-center gap-2">
							<Eye size={20} class="text-muted-foreground" aria-hidden="true" />
							<h3 class="text-md font-medium">Views</h3>
						</div>
						<div class="space-y-1">
							<p class="text-foreground/90 text-sm">
								{viewsText}
							</p>
							<p class="text-muted-foreground text-xs">
								{viewsVisibilityText}
							</p>
						</div>
					</div>
					<div class="space-y-2" role="listitem">
						<div class="flex items-center gap-2">
							<Copy size={20} class="text-muted-foreground" aria-hidden="true" />
							<h3 class="text-md font-medium">Copy Button</h3>
						</div>
						<div class="space-y-1">
							<p class="text-foreground/90 text-sm">
								{copyButtonVisibilityText}
							</p>
						</div>
					</div>
				</div>
				<div class="grid gap-4">
					<div class="space-y-2" role="listitem">
						<div class="flex items-center gap-2">
							<CalendarX size={20} class="text-muted-foreground" aria-hidden="true" />
							<h3 class="text-md font-medium">Expiration</h3>
						</div>
						<div class="space-y-1">
							<p class="text-foreground/90 text-sm">
								{formattedLongExpirationDate}
							</p>
							<p class="text-muted-foreground text-xs">
								{expirationVisibilityText}
							</p>
						</div>
					</div>
					<div class="space-y-2" role="listitem">
						<div class="flex items-center gap-2">
							<Download size={20} class="text-muted-foreground" aria-hidden="true" />
							<h3 class="text-md font-medium">Download Button</h3>
						</div>
						<div class="space-y-1">
							<p class="text-foreground/90 text-sm">
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
						<Eye size={16} class="mr-2" aria-hidden="true" />
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
							<p class="text-muted-foreground text-xs">
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
						<CalendarX size={16} class="mr-2" aria-hidden="true" />
						{formattedExpirationDate}
					{/snippet}
					{#snippet popoverContent()}
						<div class="space-y-0.5 text-sm">
							<p class="text-foreground/90">
								{formattedLongExpirationDate}
							</p>
							<p class="text-muted-foreground text-xs">
								{expirationVisibilityText}
							</p>
						</div>
					{/snippet}
				</PopoverBadge>
				<PopoverBadge variant="secondary" label="View whispr copy button settings" id="copy-badge">
					{#snippet content()}
						<Copy size={16} class="mr-2" aria-hidden="true" />
						{#if createdWhispr.showCopyButton}
							Visible
						{:else}
							Hidden
						{/if}
					{/snippet}
					{#snippet popoverContent()}
						<p class="text-foreground/90 text-sm">
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
						<Download size={16} class="mr-2" aria-hidden="true" />
						{#if createdWhispr.showDownloadButton}
							Visible
						{:else}
							Hidden
						{/if}
					{/snippet}
					{#snippet popoverContent()}
						<p class="text-foreground/90 text-sm break-words">
							{downloadButtonVisibilityText}
						</p>
					{/snippet}
				</PopoverBadge>
			</div>
		{/if}
	</section>
{/if}
