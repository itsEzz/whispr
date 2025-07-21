<script lang="ts">
	import { version } from '$app/environment';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Toaster } from '$lib/components/ui/sonner';
	import Eye from '@lucide/svelte/icons/eye';
	import Menu from '@lucide/svelte/icons/menu';
	import MessageSquareLock from '@lucide/svelte/icons/message-square-lock';
	import MonitorCog from '@lucide/svelte/icons/monitor-cog';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import { mode, ModeWatcher, setMode } from 'mode-watcher';
	import { type Snippet } from 'svelte';
	import '../app.css';

	// Props
	interface Props {
		children: Snippet<[]>;
	}

	let { children }: Props = $props();

	// Variables & States
	let mobileNavOpen = $state<boolean>(false);

	// Handler Functions
	function handleSetMode(newMode: 'light' | 'dark' | 'system') {
		if (newMode === mode.current) return;
		if (!document.startViewTransition) {
			setMode(newMode);
			return;
		}

		document.startViewTransition(() => {
			setMode(newMode);
		});
	}
	function handleCloseMobileMenu() {
		mobileNavOpen = false;
	}
</script>

<ModeWatcher />

<!-- Skip to content link for keyboard users -->
<a
	href="#main-content"
	class="focus:bg-background focus:text-foreground focus:outline-ring sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4"
>
	Skip to content
</a>

<Toaster
	theme={mode.current}
	duration={6000}
	closeButton
	position="top-right"
	toastOptions={{
		classes: {
			closeButton: 'pointer-events-auto'
		}
	}}
/>

{#snippet footer()}
	<p class="text-muted-foreground text-sm">
		Made with <span aria-hidden="true">❤️</span><span class="sr-only">love</span> by <Button
			variant="link"
			href="https://adriangast.de"
			target="_blank"
			rel="noreferrer"
			aria-label="Adrian Gast's Website (opens in new tab)"
			class="p-0">Adrian Gast</Button
		> | v{version}
	</p>
{/snippet}

<div class="bg-background grid min-h-screen grid-rows-[auto_1fr_auto]">
	<header
		class="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur-sm"
	>
		<div class="container flex h-14 items-center">
			<!-- Logo and Site Name -->
			<a href="/" class="mr-6 flex items-center space-x-2" aria-label="Whispr Home">
				<div class="bg-primary/10 rounded-lg p-2">
					<MessageSquareLock size={24} class="text-primary" aria-hidden="true" />
				</div>
				<span class="font-bold sm:inline-block">Whispr</span>
			</a>

			<!-- Desktop Navigation -->
			<nav class="hidden flex-1 items-center space-x-4 sm:flex" aria-label="Main Navigation">
				<a
					href="/"
					class="hover:text-primary text-sm font-medium transition-colors {page.url.pathname === '/'
						? 'text-primary'
						: 'text-muted-foreground'}"
					aria-current={page.url.pathname === '/' ? 'page' : undefined}
				>
					Create
				</a>
				<a
					href="/view"
					class="hover:text-primary text-sm font-medium transition-colors {page.url.pathname.startsWith(
						'/v'
					)
						? 'text-primary'
						: 'text-muted-foreground'}"
					aria-current={page.url.pathname === '/view' ? 'page' : undefined}
				>
					View
				</a>
			</nav>

			<div class="flex flex-1 items-center justify-end space-x-2">
				<!-- Theme Toggle -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						aria-label="Change theme"
						aria-haspopup="true"
						id="theme-menu-button"
					>
						<Button variant="ghost" size="icon">
							<Sun
								size={16}
								class="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
								aria-hidden="true"
							/>
							<Moon
								size={16}
								class="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
								aria-hidden="true"
							/>
							<span class="sr-only">Toggle theme</span>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" aria-labelledby="theme-menu-button">
						<DropdownMenu.Item onclick={() => handleSetMode('light')} role="menuitem">
							<Sun size={16} class="mr-2" aria-hidden="true" />
							<span>Light</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => handleSetMode('dark')} role="menuitem">
							<Moon size={16} class="mr-2" aria-hidden="true" />
							<span>Dark</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => handleSetMode('system')} role="menuitem">
							<MonitorCog size={16} class="mr-2" aria-hidden="true" />
							<span>System</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				<!-- Mobile Navigation Trigger -->
				<div class="sm:hidden">
					<Sheet.Root bind:open={mobileNavOpen}>
						<Sheet.Trigger
							aria-label="Open navigation menu"
							aria-expanded={mobileNavOpen}
							aria-controls="mobile-navigation"
						>
							<Button variant="ghost" size="icon">
								<Menu size={20} aria-hidden="true" />
								<span class="sr-only">Toggle Menu</span>
							</Button>
						</Sheet.Trigger>
						<Sheet.Content
							side="left"
							class="w-[280px] p-0"
							id="mobile-navigation"
							role="dialog"
							aria-label="Navigation menu"
						>
							<div class="flex h-full flex-col">
								<div class="border-b p-2 px-4">
									<a
										href="/"
										class="flex items-center space-x-3"
										onclick={handleCloseMobileMenu}
										aria-label="Whispr Home"
									>
										<div class="bg-primary/10 rounded-lg p-2">
											<MessageSquareLock size={24} class="text-primary" aria-hidden="true" />
										</div>

										<span class="text-lg font-bold">Whispr</span>
									</a>
								</div>

								<div class="flex-1 p-2">
									<nav class="flex flex-col space-y-1" aria-label="Mobile Navigation">
										<a
											href="/"
											class="hover:bg-accent hover:text-accent-foreground group flex items-center rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 {page
												.url.pathname === '/'
												? 'bg-primary/10 text-primary'
												: 'text-foreground'}"
											onclick={handleCloseMobileMenu}
											aria-current={page.url.pathname === '/' ? 'page' : undefined}
										>
											<div
												class="mr-3 flex h-8 w-8 items-center justify-center rounded-md {page.url
													.pathname === '/'
													? 'bg-primary/20'
													: 'bg-muted group-hover:bg-accent'}"
											>
												<MessageSquareLock size={16} aria-hidden="true" />
											</div>

											<span>Create</span>
										</a>

										<a
											href="/view"
											class="hover:bg-accent hover:text-accent-foreground group flex items-center rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 {page.url.pathname.startsWith(
												'/v'
											)
												? 'bg-primary/10 text-primary'
												: 'text-foreground'}"
											onclick={handleCloseMobileMenu}
											aria-current={page.url.pathname === '/view' ? 'page' : undefined}
										>
											<div
												class="mr-3 flex h-8 w-8 items-center justify-center rounded-md {page.url.pathname.startsWith(
													'/v'
												)
													? 'bg-primary/20'
													: 'bg-muted group-hover:bg-accent'}"
											>
												<Eye size={16} aria-hidden="true" />
											</div>

											<span>View</span>
										</a>
									</nav>
								</div>

								<div class="flex justify-center border-t p-2">
									{@render footer()}
								</div>
							</div>
						</Sheet.Content>
					</Sheet.Root>
				</div>
			</div>
		</div>
	</header>

	<main id="main-content" class="flex-1" tabindex="-1">
		{@render children()}
	</main>

	<footer class="border-t py-2">
		<div class="container flex flex-col items-center justify-between gap-2">
			{@render footer()}
		</div>
	</footer>
</div>
