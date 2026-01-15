<script lang="ts">
	import PopoverBadge from '$lib/components/common/popover-badge.svelte';
	import type { CreatedWhispr } from '$lib/types/created-whispr';
	import { formatDate, getUserLocale } from '$lib/utils/date-helpers';
	import CalendarX from '@lucide/svelte/icons/calendar-x';
	import Copy from '@lucide/svelte/icons/copy';
	import Download from '@lucide/svelte/icons/download';
	import Eye from '@lucide/svelte/icons/eye';

	// Props
	interface Props {
		createdWhispr: CreatedWhispr | null;
	}

	let { createdWhispr }: Props = $props();

	// Variables & States
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
		if (createdWhispr?.showViews) return 'Download whispr button visible to recipients';
		else return 'Download whispr button hidden from recipients';
	});
</script>

{#if createdWhispr}
	<section aria-labelledby="whispr-overview-title">
		<h2 id="whispr-overview-title" class="sr-only">Whispr settings overview</h2>
		<div class="flex flex-wrap justify-center gap-2" role="list">
			<PopoverBadge variant="secondary" label="View whispr view settings" id="views-badge">
				{#snippet content()}
					<Eye size={16} aria-hidden="true" />
					{#if createdWhispr.unlimitedViews === true}
						Unlimited views
					{:else}
						<span>{createdWhispr.views} {createdWhispr.views === 1 ? 'view' : 'views'}</span>
					{/if}
				{/snippet}
				{#snippet popoverContent()}
					<div class="flex flex-col gap-0.5 text-sm">
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
					<CalendarX size={16} aria-hidden="true" />
					<span>{formattedExpirationDate}</span>
				{/snippet}
				{#snippet popoverContent()}
					<div class="flex flex-col gap-0.5 text-sm">
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
					<Copy size={16} aria-hidden="true" />
					<span
						>{#if createdWhispr.showCopyButton}
							Visible
						{:else}
							Hidden
						{/if}</span
					>
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
					<Download size={16} aria-hidden="true" />
					<span
						>{#if createdWhispr.showDownloadButton}
							Visible
						{:else}
							Hidden
						{/if}</span
					>
				{/snippet}
				{#snippet popoverContent()}
					<p class="text-foreground/90 text-sm wrap-break-word">
						{downloadButtonVisibilityText}
					</p>
				{/snippet}
			</PopoverBadge>
		</div>
	</section>
{/if}
