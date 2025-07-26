<script lang="ts">
	import * as Alert from '$lib/components/ui/alert/index.js';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
</script>

<Alert.Root
	class="border-orange-300/30 bg-orange-500/10 dark:border-orange-400/30 dark:bg-orange-400/10"
>
	<TriangleAlert aria-hidden="true" />
	<Alert.Title>No password set</Alert.Title>
	<Alert.Description>
		Everyone with access to the link can view and decrypt this whispr!
	</Alert.Description>
</Alert.Root>
