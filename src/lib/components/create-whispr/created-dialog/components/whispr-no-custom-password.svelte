<script lang="ts">
	import * as Alert from '$lib/components/ui/alert/index.js';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
</script>

<Alert.Root
	class="border-orange-300/30 bg-orange-500/10 text-orange-700 dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-300 [&>svg]:text-current"
>
	<TriangleAlert aria-hidden="true" />
	<Alert.Title>Password embedded in link</Alert.Title>
	<Alert.Description class="text-orange-700 dark:text-orange-300">
		An automatically generated password was used for encryption and is embedded in the share link.
		This means anyone with the link can decrypt and view this whispr!
	</Alert.Description>
</Alert.Root>
