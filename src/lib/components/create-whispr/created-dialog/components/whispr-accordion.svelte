<script lang="ts">
	import CopyButton from '$lib/components/common/copy-button.svelte';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { copyText, isCopySupported } from '$lib/utils/copy';
	import { getSvgString, qrCodeToPng, qrCodeToSvg } from '$lib/utils/qrcode';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import CodeXml from '@lucide/svelte/icons/code-xml';
	import ImageDown from '@lucide/svelte/icons/image-down';
	import { mode } from 'mode-watcher';
	import QRCode from 'qrcode';
	import { toast } from 'svelte-sonner';

	// Props
	interface Props {
		whisprUrl: string;
		deleteUrl: string;
		whisprId?: string;
	}

	let { whisprUrl, deleteUrl, whisprId }: Props = $props();

	// Variables & States
	let exportQrCodeOpen = $state<boolean>(false);

	// Derived values
	let isDeleteUrlAvailable = $derived(deleteUrl.length > 0);
	let deleteUrlValue = $derived(isDeleteUrlAvailable ? deleteUrl : 'Something went wrong...');

	// Handler Functions
	async function handleDownloadQrCodePng() {
		if (!(await qrCodeToPng(whisprUrl, whisprId))) {
			toast.error('Download failed', {
				description: 'Could not generate PNG QR code. Please try again.'
			});
		}
	}

	async function handleDownloadQrCodeSvg() {
		if (!(await qrCodeToSvg(whisprUrl, whisprId))) {
			toast.error('Download failed', {
				description: 'Could not generate SVG QR code. Please try again.'
			});
		}
	}

	async function handleCopyQrCodeSvg() {
		const svg = await getSvgString(whisprUrl);
		if (svg) {
			if (await copyText(svg)) {
				toast.success('SVG code copied', {
					description: 'QR code SVG copied to clipboard.'
				});
			} else {
				toast.error('Copy failed', {
					description: 'Could not copy SVG code to clipboard. Please try again.'
				});
			}
		} else {
			toast.error('Generation failed', {
				description: 'Could not generate SVG QR code. Please try again.'
			});
		}
	}

	async function handleCopyDeleteUrl(): Promise<boolean> {
		return await copyText(deleteUrl);
	}

	function handleClickDeleteLinkInput(
		event: MouseEvent & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		event.currentTarget.select();
	}

	// Lifecycle
	$effect(() => {
		if (!whisprUrl) return;

		QRCode.toCanvas(
			document.getElementById('qrcode-canvas'),
			whisprUrl,
			{
				width: 150,
				margin: 0,
				color: {
					dark: mode.current === 'dark' ? '#ffffff' : '#000000',
					light: '#ffffff00'
				}
			},
			function (err) {
				if (err) {
					toast.error('QR Code generation failed', {
						description: "We're having trouble generating the QR code. Please try again."
					});
				}
			}
		);
	});
</script>

<Accordion.Root type="multiple" class="w-full rounded-lg border">
	<Accordion.Item value="qrcode" class="px-4">
		<Accordion.Trigger
			class="py-2 hover:no-underline"
			id="qrcode-trigger"
			aria-controls="qrcode-content"
		>
			Share with QR Code
		</Accordion.Trigger>
		<Accordion.Content id="qrcode-content">
			<div class="flex flex-col gap-6 py-4 min-[500px]:flex-row">
				<div class="flex justify-center min-[500px]:justify-start">
					<canvas
						id="qrcode-canvas"
						class="aspect-square w-[150px] shrink-0"
						aria-label="QR code for sharing your whispr"
					></canvas>
				</div>
				<div class="flex flex-col items-start gap-3">
					<div class="flex flex-col gap-1.5">
						<p class="text-sm font-medium">Share on mobile devices</p>
						<p class="text-muted-foreground text-sm">
							Scan this QR code with your phone's camera to instantly access your whispr or download
							the QR code as PNG/SVG or copy the code for sharing.
						</p>
					</div>
					<DropdownMenu.Root bind:open={exportQrCodeOpen}>
						<DropdownMenu.Trigger
							aria-label="Export QR code options"
							aria-expanded={exportQrCodeOpen}
							aria-haspopup="menu"
							id="export-qr-dropdown"
						>
							<Button variant="secondary" size="sm" class="w-fit">
								Export QR Code
								{#if exportQrCodeOpen}
									<ChevronUp aria-hidden="true" />
								{:else}
									<ChevronDown aria-hidden="true" />
								{/if}
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content aria-labelledby="export-qr-dropdown" role="menu">
							<DropdownMenu.Item onclick={handleDownloadQrCodePng} role="menuitem">
								<ImageDown aria-hidden="true" />
								<span>Download as PNG</span>
							</DropdownMenu.Item>
							<DropdownMenu.Item onclick={handleDownloadQrCodeSvg} role="menuitem">
								<ImageDown aria-hidden="true" />
								<span>Download as SVG</span>
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onclick={handleCopyQrCodeSvg} role="menuitem">
								<CodeXml aria-hidden="true" />
								<span>Copy SVG Code</span>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</div>
		</Accordion.Content>
	</Accordion.Item>
	<Accordion.Item value="delete" class="px-4">
		<Accordion.Trigger
			class="py-2 hover:no-underline"
			id="delete-trigger"
			aria-controls="delete-content"
		>
			Save Deletion Link
		</Accordion.Trigger>
		<Accordion.Content id="delete-content">
			<div class="flex flex-col gap-2">
				<p class="text-muted-foreground text-sm">
					Use the link below to permanently delete your whispr at any time. Make sure to save it!
				</p>
				<div class="flex flex-col gap-2">
					<Label for="deletion-link-input" class="sr-only">Deletion link</Label>
					<Input
						type="text"
						id="deletion-link-input"
						placeholder="Your deletion link will appear here..."
						class="focus-visible:ring-0 focus-visible:ring-offset-0"
						readonly
						value={deleteUrlValue}
						aria-invalid={!isDeleteUrlAvailable}
						onclick={handleClickDeleteLinkInput}
					/>
					{#if isCopySupported()}
						<CopyButton
							variant="secondary"
							size="sm"
							text="Copy deletion link"
							copySuccessText="Deletion link copied"
							copyFailedText="Copy failed"
							copyFn={handleCopyDeleteUrl}
							class="w-full"
							disabled={!isDeleteUrlAvailable}
							aria-label="Copy deletion link to clipboard"
						/>
					{/if}
				</div>
			</div>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
