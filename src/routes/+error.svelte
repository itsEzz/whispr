<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Home from '@lucide/svelte/icons/home';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import SearchX from '@lucide/svelte/icons/search-x';
	import SvelteSeo from 'svelte-seo';

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

<SvelteSeo
	title={is404 ? 'Whispr - Page Not Found' : 'Whispr - Error'}
	description={is404
		? 'The page you are looking for could not be found. Return to Whispr to create or view secure messages.'
		: 'An error occurred while processing your request. Please try again or return to the main page.'}
	openGraph={{
		title: is404 ? 'Whispr - Page Not Found' : 'Whispr - Error',
		description: is404
			? 'The page you are looking for could not be found. Return to Whispr to create or view secure messages.'
			: 'An error occurred while processing your request. Please try again or return to the main page.',
		type: 'website'
	}}
	twitter={{
		title: is404 ? 'Whispr - Page Not Found' : 'Whispr - Error',
		description: is404
			? 'The page you are looking for could not be found. Return to Whispr to create or view secure messages.'
			: 'An error occurred while processing your request. Please try again or return to the main page.'
	}}
/>

<div class="container mx-auto flex h-full flex-col overflow-hidden p-4">
	<div class="mt-12 flex justify-center sm:mt-16 md:mt-20">
		<Card.Root class="w-full max-w-lg">
			<Card.Header class="text-center">
				<div class="bg-muted/50 mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
					{#if is404}
						<SearchX size={40} aria-hidden="true" />
					{:else}
						<AlertTriangle size={40} class="text-destructive" aria-hidden="true" />
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
					<p class="text-muted-foreground text-sm">
						{#if is404}
							The page you're looking for doesn't exist or has been moved. <br />
							Please check the URL for any typos.
						{:else}
							If you continue to experience issues, try refreshing the page, contacting the site's
							administrator or opening an issue in the GitHub repository.
						{/if}
					</p>

					{#if !is404}
						<div class="bg-muted/20 rounded-lg border p-3">
							<p class="text-muted-foreground font-mono text-xs">
								Error Code: {page.status}
								{#if page.error?.message}
									<br />
									Message: {page.error?.message}
								{/if}
							</p>
						</div>
					{/if}

					<p class="text-muted-foreground text-xs">
						Need help? Visit the
						<a
							href="https://github.com/itsEzz/whispr"
							target="_blank"
							rel="noopener noreferrer"
							class="hover:text-foreground underline underline-offset-4 transition-colors"
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
