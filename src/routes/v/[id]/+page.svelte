<script lang="ts">
	import ViewWhispr from '$lib/components/view-whispr/view-whispr.svelte';
	import SvelteSeo from 'svelte-seo';
	import type { LayoutProps } from './$types';

	// Props
	let { data }: LayoutProps = $props();
</script>

<SvelteSeo
	title="Secure Message - Whispr"
	description="Viewing encrypted message content."
	noindex={true}
	nofollow={true}
	nositelinkssearchbox={true}
/>

<ViewWhispr whispr={data.whispr} />
