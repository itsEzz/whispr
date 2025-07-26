<script lang="ts">
	import { page } from '$app/state';
	import ViewWhispr from '$lib/components/view-whispr/view-whispr.svelte';
	import SvelteSeo from 'svelte-seo';
	import type { LayoutProps } from '../$types';

	// Props
	let { data }: LayoutProps = $props();
</script>

<SvelteSeo
	title="Whispr - View Secure Message"
	description="Viewing encrypted message content."
	noindex={true}
	nofollow={true}
	nositelinkssearchbox={true}
/>

<ViewWhispr whispr={data.whispr} encodedUrlPassword={page.params.pw} />
