<script lang="ts">
	import { page } from '$app/state';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import type { CreatedWhispr } from '$lib/types/created-whispr';
	import { Base64 } from 'js-base64';
	import { Lock, TriangleAlert } from 'lucide-svelte';
	import DialogDrawer from '../../common/dialog-drawer.svelte';
	import WhisprAccordion from './components/whispr-accordion.svelte';
	import WhisprLink from './components/whispr-link.svelte';
	import WhisprOverview from './components/whispr-overview.svelte';

	// Props
	interface Props {
		createdWhispr: CreatedWhispr | null;
		randomPassword: string | null;
		onOpenChange: (open: boolean) => void;
	}

	let { createdWhispr, randomPassword, onOpenChange }: Props = $props();

	// Variables & States
	let whisprUrl = $derived.by(() => {
		if (createdWhispr === null) return '';
		return `${page.url.origin}/v/${createdWhispr.id}${randomPassword !== null ? `/${Base64.encode(randomPassword, true)}` : ''}`;
	});
	let deleteUrl = $derived.by(() => {
		if (createdWhispr === null) return '';
		return `${page.url.origin}/delete/${createdWhispr.deleteId}`;
	});
</script>

<DialogDrawer
	open={createdWhispr !== null}
	{onOpenChange}
	description="Your secure and encrypted whispr link is ready to share!"
	escapeKeydownBehavior="ignore"
	interactOutsideBehavior="ignore"
	drawerBodyCss="mb-4"
	dialogContentCss="sm:max-w-[650px]"
	idToFocusOnOpen="copy-whispr-link"
	aria-labelledby="whispr-created-dialog-title"
	aria-describedby="whispr-created-dialog-description"
	role="dialog"
>
	{#snippet title()}
		<div class="flex items-center space-x-2">
			<Lock class="mr-2 text-green-500" /> Whispr created!
		</div>
	{/snippet}
	{#snippet body()}
		<div class="grid h-full items-start gap-2">
			{#if randomPassword !== null}
				<div
					class="flex gap-3 rounded-lg border border-orange-300/30 bg-orange-500/10 p-3 text-orange-700 dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-300"
					role="alert"
					id="no-password-alert"
				>
					<TriangleAlert class="size-5 shrink-0" aria-hidden="true" />
					<div class="space-y-1">
						<p class="font-medium leading-none">No password set</p>
						<p class="text-sm text-orange-700/90 dark:text-orange-300/90">
							Everyone with access to the link can view and decrypt this whispr!
						</p>
					</div>
				</div>
			{/if}

			<WhisprOverview {createdWhispr} />

			<WhisprLink {createdWhispr} {whisprUrl} />

			<Separator class="my-3" decorative aria-hidden="true" />

			<WhisprAccordion {whisprUrl} {deleteUrl} whisprId={createdWhispr?.id} />
		</div>
	{/snippet}
</DialogDrawer>
