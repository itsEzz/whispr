<script lang="ts">
	import { page } from '$app/state';
	import ViewWhispr from '$lib/components/view-whispr/view-whispr.svelte';
	import type { LayoutProps } from '../$types';

	// Props
	let { data }: LayoutProps = $props();
</script>

<ViewWhispr whispr={data.whispr} encodedUrlPassword={page.params.pw} />
