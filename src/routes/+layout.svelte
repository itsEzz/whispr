<script lang="ts">
	import { version } from '$app/environment';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Menu, MessageSquareLock, MonitorCog, Moon, Shield, Sun } from 'lucide-svelte';
	import { mode, ModeWatcher, setMode } from 'mode-watcher';
	import type { Snippet } from 'svelte';
	import { Toaster } from 'svelte-sonner';
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
	class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-4 focus:text-foreground focus:outline-ring"
>
	Skip to content
</a>

<Toaster
	theme={mode.current}
	duration={6000}
	closeButton
	toastOptions={{
		classes: {
			closeButton: 'pointer-events-auto'
		}
	}}
/>

<div class="grid min-h-screen grid-rows-[auto_1fr_auto] bg-background">
	<header
		class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
	>
		<div class="container flex h-14 items-center">
			<!-- Logo and Site Name -->
			<a href="/" class="mr-6 flex items-center space-x-2" aria-label="Whispr Home">
				<MessageSquareLock class="h-6 w-6 text-primary" aria-hidden="true" />
				<span class="font-bold sm:inline-block">whispr</span>
			</a>

			<!-- Desktop Navigation -->
			<nav class="hidden flex-1 items-center space-x-4 sm:flex" aria-label="Main Navigation">
				<a
					href="/"
					class="text-sm font-medium transition-colors hover:text-primary {page.url.pathname === '/'
						? 'text-primary'
						: 'text-muted-foreground'}"
					aria-current={page.url.pathname === '/' ? 'page' : undefined}
				>
					Create
				</a>
				<a
					href="/view"
					class="text-sm font-medium transition-colors hover:text-primary {page.url.pathname.startsWith(
						'/v'
					)
						? 'text-primary'
						: 'text-muted-foreground'}"
					aria-current={page.url.pathname === '/view' ? 'page' : undefined}
				>
					View
				</a>
				<a
					href="/about"
					class="text-sm font-medium transition-colors hover:text-primary {page.url.pathname ===
					'/about'
						? 'text-primary'
						: 'text-muted-foreground'}"
					aria-current={page.url.pathname === '/about' ? 'page' : undefined}
				>
					About
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
								class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
								aria-hidden="true"
							/>
							<Moon
								class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
								aria-hidden="true"
							/>
							<span class="sr-only">Toggle theme</span>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" aria-labelledby="theme-menu-button">
						<DropdownMenu.Item onclick={() => handleSetMode('light')} role="menuitem">
							<Sun class="mr-2 h-4 w-4" aria-hidden="true" />
							<span>Light</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => handleSetMode('dark')} role="menuitem">
							<Moon class="mr-2 h-4 w-4" aria-hidden="true" />
							<span>Dark</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => handleSetMode('system')} role="menuitem">
							<MonitorCog class="mr-2 h-4 w-4" aria-hidden="true" />
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
								<Menu class="h-5 w-5" aria-hidden="true" />
								<span class="sr-only">Toggle Menu</span>
							</Button>
						</Sheet.Trigger>
						<Sheet.Content
							side="left"
							class="w-[240px] sm:w-[280px]"
							id="mobile-navigation"
							role="dialog"
							aria-label="Navigation menu"
						>
							<a
								href="/"
								class="mb-6 flex items-center space-x-2"
								onclick={handleCloseMobileMenu}
								aria-label="Whispr Home"
							>
								<Shield class="h-6 w-6 text-primary" aria-hidden="true" />
								<span class="font-bold">whispr</span>
							</a>
							<nav class="flex flex-col space-y-2" aria-label="Mobile Navigation">
								<a
									href="/"
									class="rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-accent hover:text-accent-foreground {page
										.url.pathname === '/'
										? 'text-primary'
										: 'text-muted-foreground'}"
									onclick={handleCloseMobileMenu}
									aria-current={page.url.pathname === '/' ? 'page' : undefined}
								>
									Create
								</a>
								<a
									href="/view"
									class="rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-accent hover:text-accent-foreground {page.url.pathname.startsWith(
										'/v'
									)
										? 'text-primary'
										: 'text-muted-foreground'}"
									onclick={handleCloseMobileMenu}
									aria-current={page.url.pathname === '/view' ? 'page' : undefined}
								>
									View
								</a>
								<a
									href="/about"
									class="rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-accent hover:text-accent-foreground {page
										.url.pathname === '/about'
										? 'text-primary'
										: 'text-muted-foreground'}"
									onclick={handleCloseMobileMenu}
									aria-current={page.url.pathname === '/about' ? 'page' : undefined}
								>
									About
								</a>
							</nav>
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
			<p class="text-sm text-muted-foreground">
				Made with <span aria-hidden="true">❤️</span><span class="sr-only">love</span> by <Button
					variant="link"
					href="https://adriangast.de"
					target="_blank"
					rel="noreferrer"
					aria-label="Adrian Gast's Website (opens in new tab)"
					class="p-0">Adrian Gast</Button
				> | v{version}
			</p>
		</div>
	</footer>
</div>
