<script lang="ts">
	import ViewWhispr from '$lib/components/view-whispr/view-whispr.svelte';
	import type { LayoutProps } from './$types';

	// Props
	let { data }: LayoutProps = $props();
</script>

<ViewWhispr form={data.form} whispr={data.whispr} />
