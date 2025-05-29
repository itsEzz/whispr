<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { AlertTriangle, ArrowLeft, Home, RefreshCw, SearchX } from 'lucide-svelte';

	// Variables & States
	const is404 = page.status === 404;

	// Handler Functions
	function handleClickRefreshPage() {
		window.location.reload();
	}

	function handleClickGoBack() {
		if (window.history.length > 1) {
			window.history.back();
		} else {
			window.location.href = '/';
		}
	}
</script>

<div class="container mx-auto flex h-full flex-col overflow-hidden p-4">
	<div class="mt-12 flex justify-center sm:mt-16 md:mt-20">
		<Card.Root class="w-full max-w-lg">
			<Card.Header class="text-center">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50"
				>
					{#if is404}
						<SearchX class="h-10 w-10" aria-hidden="true" />
					{:else}
						<AlertTriangle class="h-10 w-10 text-destructive" aria-hidden="true" />
					{/if}
				</div>
				<Card.Title class="text-2xl" id="error-heading">
					{#if is404}
						Page Not Found
					{:else}
						Something Went Wrong
					{/if}
				</Card.Title>
			</Card.Header>

			<Card.Content class="text-center" aria-describedby="error-heading">
				<div class="space-y-4">
					<p class="text-sm text-muted-foreground">
						{#if is404}
							The page you're looking for doesn't exist or has been moved. <br />
							Please check the URL for any typos.
						{:else}
							If you continue to experience issues, try refreshing the page, contacting the site's
							administrator or opening an issue in the GitHub repository.
						{/if}
					</p>

					{#if !is404}
						<div class="rounded-lg border bg-muted/20 p-3">
							<p class="font-mono text-xs text-muted-foreground">
								Error Code: {page.status}
								{#if page.error?.message}
									<br />
									Message: {page.error?.message}
								{/if}
							</p>
						</div>
					{/if}

					<p class="text-xs text-muted-foreground">
						Need help? Visit the
						<a
							href="https://github.com/itsEzz/whispr"
							target="_blank"
							rel="noopener noreferrer"
							class="underline underline-offset-4 transition-colors hover:text-foreground"
							aria-label="GitHub repository (opens in new tab)"
						>
							GitHub repository
						</a>
					</p>
				</div>
			</Card.Content>

			<Card.Footer class="flex flex-wrap justify-center gap-3">
				<Button variant="outline" onclick={handleClickGoBack} aria-label="Go back to previous page">
					<ArrowLeft aria-hidden="true" />
					Go Back
				</Button>

				{#if !is404}
					<Button variant="outline" onclick={handleClickRefreshPage} aria-label="Refresh the page">
						Refresh Page
						<RefreshCw aria-hidden="true" />
					</Button>
				{/if}

				<Button href="/" aria-label="Go back to home page">
					Back to Home
					<Home aria-hidden="true" />
				</Button>
			</Card.Footer>
		</Card.Root>
	</div>
</div>
