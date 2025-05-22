<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { AlertTriangle, CircleDot, Home, RefreshCw } from 'lucide-svelte';

	// Variables & States
	const status = page.status;
	const message = page.error?.message || 'Something went wrong';

	// Handler Functions
	function handleRefreshPage() {
		window.location.reload();
	}

	// Functions
	function getErrorDescription(status: number): string {
		switch (status) {
			case 404:
				return "The page you're looking for doesn't exist or has been moved.";
			case 500:
				return "We're experiencing some technical difficulties. Please try again later.";
			default:
				return 'An unexpected error occurred while processing your request.';
		}
	}
</script>

<svelte:head>
	<title>Error {status} | Whispr</title>
	<meta name="description" content="Error {status}: {message}" />
</svelte:head>

<div
	class="container flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8"
	role="main"
	aria-labelledby="error-heading"
>
	<Card.Root class="w-full max-w-lg">
		<Card.Header>
			<div class="flex items-center gap-2">
				<AlertTriangle class="h-8 w-8 text-destructive" aria-hidden="true" />
				<Card.Title id="error-heading">
					Error {status}
				</Card.Title>
			</div>
			<Card.Description class="text-base">
				{message}
			</Card.Description>
		</Card.Header>

		<Card.Content>
			<div class="space-y-4">
				<p class="text-muted-foreground">{getErrorDescription(status)}</p>

				<div class="rounded-md bg-muted p-4" role="region" aria-label="Help suggestions">
					<p class="mb-2 font-medium">Need help?</p>
					<p class="text-sm text-muted-foreground">
						If you continue to experience issues, you can try refreshing the page, returning to the
						home page, or reporting the issue on GitHub.
					</p>
				</div>
			</div>
		</Card.Content>

		<Card.Footer class="flex flex-wrap justify-center gap-2 sm:justify-end">
			<Button variant="outline" onclick={handleRefreshPage} aria-label="Refresh the page">
				<RefreshCw aria-hidden="true" />
				Refresh Page
			</Button>

			<Button
				variant="outline"
				href="https://github.com/itsEzz/whispr/issues/new"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Report issue on GitHub (opens in a new tab)"
			>
				<CircleDot aria-hidden="true" />
				Report Issue
			</Button>

			<Button href="/" aria-label="Go back to home page">
				<Home aria-hidden="true" />
				Back to Home
			</Button>
		</Card.Footer>
	</Card.Root>
</div>
