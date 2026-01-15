<script lang="ts">
	import { page } from '$app/state';
	import CopyButton from '$lib/components/common/copy-button.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { ErrorPageConfig } from '$lib/types/error';
	import { copyText } from '$lib/utils/copy.js';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Home from '@lucide/svelte/icons/home';
	import Pause from '@lucide/svelte/icons/pause';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import SearchX from '@lucide/svelte/icons/search-x';
	import SvelteSeo from 'svelte-seo';
	import type { PageProps } from './$types';

	// Props
	let { data }: PageProps = $props();

	// Variables & States
	const is404 = page.status === 404;
	const is429 = page.status === 429;
	const errorDetails: string[] = $derived([
		`Error Code: ${page.status}`,
		`Message: ${page.error?.message ?? 'N/A'}`,
		`Correlation ID: ${data.correlationId}`
	]);

	const config: ErrorPageConfig = {
		seo: {
			title: is404
				? 'Whispr - Page Not Found'
				: is429
					? 'Whispr - Rate Limit Exceeded'
					: 'Whispr - Error',
			description: is404
				? 'The page you are looking for could not be found. Return to Whispr to create or view secure messages.'
				: is429
					? ''
					: 'An error occurred while processing your request. Please try again or return to the main page.'
		},
		icon: is404 ? SearchX : is429 ? Pause : AlertTriangle,
		iconClass: !is404 && !is429 ? 'text-destructive' : undefined,
		title: is404 ? 'Page Not Found' : is429 ? 'Too Many Requests' : 'Something Went Wrong',
		description: is404
			? "The page you're looking for doesn't exist or has been moved. Please check the URL for any typos."
			: is429
				? "You've made too many requests in a short period. Please wait a moment before trying again. This helps protect the service from abuse and ensures it remains available for everyone."
				: 'If you continue to experience issues, try refreshing the page, contacting the site administrator or opening an issue in the GitHub repository.'
	};

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

	async function handleCopyErrorDetails(): Promise<boolean> {
		return await copyText(errorDetails.join('\n'));
	}
</script>

<SvelteSeo
	title={config.seo.title}
	description={config.seo.description}
	openGraph={{
		title: config.seo.title,
		description: config.seo.description,
		type: 'website'
	}}
	twitter={{
		title: config.seo.title,
		description: config.seo.description
	}}
/>

<div class="container mx-auto flex h-full flex-col overflow-hidden p-4">
	<div class="mt-12 flex justify-center sm:mt-16 md:mt-20">
		<Card.Root class="w-full max-w-lg">
			<Card.Header class="text-center">
				<div class="bg-muted/50 mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
					<config.icon size={40} class={config.iconClass} aria-hidden="true" />
				</div>
				<Card.Title class="text-2xl" id="error-heading">
					{config.title}
				</Card.Title>
			</Card.Header>

			<Card.Content class="text-center" aria-describedby="error-heading">
				<div class="space-y-4">
					<p class="text-muted-foreground text-sm">
						{config.description}
					</p>

					<div class="bg-muted/20 relative rounded-lg border p-3">
						<CopyButton
							copyFn={handleCopyErrorDetails}
							variant="ghost"
							size="sm"
							class="absolute top-1 right-1"
							aria-label="Copy error details"
						/>
						<p class="text-muted-foreground font-mono text-xs">
							{#each errorDetails as detail (detail)}
								{detail}<br />
							{/each}
						</p>
					</div>

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
