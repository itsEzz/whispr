<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { passwordGenerator } from '$lib/crypto/pw-gen';
	import { getPasswordStrength } from '$lib/crypto/pw-strength';
	import { cn } from '$lib/utils';
	import Check from '@lucide/svelte/icons/check';
	import Dices from '@lucide/svelte/icons/dices';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Info from '@lucide/svelte/icons/info';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import X from '@lucide/svelte/icons/x';
	import { toast } from 'svelte-sonner';
	import { passwordSchema } from '../../schemas/create-schema';
	import FormError from '../common/form-error.svelte';

	// Props
	interface Props {
		disabled?: boolean;
		password: string;
	}
	let { disabled = false, password = $bindable() }: Props = $props();

	// Variables & States
	let showPassword = $state<boolean>(false);
	let loading = $state<boolean>(false);
	let validationResult = $derived(passwordSchema.safeParse(password));
	let errors = $derived(validationResult.error?.flatten().formErrors);
	let passwordStrength = $derived(getPasswordStrength(password));

	// Handler Functions
	function handleTogglePasswordVisibility() {
		showPassword = !showPassword;
	}

	async function handleGeneratePassword() {
		loading = true;
		try {
			password = passwordGenerator.generate(30);

			const passwordInput = document.getElementById('whispr-password');
			if (passwordInput) {
				passwordInput.focus();
				showPassword = true;
			}
		} catch (error) {
			toast.error('Password generation failed', {
				description: "We're having trouble creating a password."
			});
		} finally {
			loading = false;
		}
	}

	// Functions
	export function isValidPassword(): boolean {
		return validationResult.success;
	}

	export function getErrors(): string[] | undefined {
		return errors;
	}
</script>

{#snippet passwordStrengthIndicator(ok: boolean, label: string, fullColSpan: boolean = false)}
	<div class={cn('flex items-center gap-1', fullColSpan && 'col-span-full')}>
		{#if ok}
			<Check class="size-4 text-green-600" aria-hidden="true" />
		{:else}
			<X class="text-muted-foreground size-4" aria-hidden="true" />
		{/if}
		<span class={ok ? 'text-green-600' : 'text-muted-foreground'}>
			{label}
		</span>
	</div>
{/snippet}

<div class="mb-3 space-y-2 px-4">
	<Label for="whispr-password" class={cn(errors && 'text-destructive')}>
		Password
		{#if errors}
			<span class="sr-only">(invalid input)</span>
		{/if}
	</Label>

	<span id="password-controls" class="sr-only">Password input with controls</span>
	<div class="flex items-center space-x-2" role="group" aria-labelledby="password-controls">
		<Input
			disabled={disabled || loading}
			type={showPassword ? 'text' : 'password'}
			id="whispr-password"
			name="password"
			placeholder="Enter a secure password"
			min={1}
			max={1000}
			bind:value={password}
			aria-invalid={!validationResult.success}
			aria-describedby={errors ? 'password-error' : undefined}
			autocomplete="new-password"
		/>
		<div>
			<Button
				{disabled}
				variant="secondary"
				size="icon"
				aria-label={showPassword ? 'Hide password' : 'Show password'}
				aria-pressed={showPassword}
				onclick={handleTogglePasswordVisibility}
			>
				{#if showPassword}
					<EyeOff aria-hidden="true" />
				{:else}
					<Eye aria-hidden="true" />
				{/if}
				<span class="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
			</Button>
		</div>
		<div>
			<Button
				disabled={disabled || loading}
				variant="secondary"
				size="icon"
				aria-label="Generate secure password"
				onclick={handleGeneratePassword}
			>
				{#if loading}
					<LoaderCircle class="animate-spin" aria-hidden="true" />
					<span class="sr-only">Generating password...</span>
				{:else}
					<Dices aria-hidden="true" />
					<span class="sr-only">Generate password</span>
				{/if}
			</Button>
		</div>
	</div>
	<FormError {errors} id="password-error" />

	{#if password}
		<div class="flex items-center gap-2">
			<div class="bg-muted mt-0.5 h-1.5 flex-1 overflow-hidden rounded-full">
				<div
					class={cn('h-full transition-all duration-300', passwordStrength.barColor)}
					style="width: {((passwordStrength.score + 1) / 5) * 100}%"
				></div>
			</div>
			<div class="flex items-center">
				<span class={cn('min-w-fit text-xs font-semibold', passwordStrength.textColor)}>
					{passwordStrength.label}
				</span>
				<Popover.Root>
					<Popover.Trigger>
						<Button
							variant="ghost"
							size="icon"
							class="size-8"
							aria-label="Password requirements and suggestions"
						>
							<Info aria-hidden="true" />
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-64 p-3" align="end">
						<div class="space-y-3">
							<div>
								<div class="mb-2 text-sm font-medium">Password strength</div>
								<div class="grid grid-cols-2 gap-1 text-xs">
									{@render passwordStrengthIndicator(passwordStrength.hasLowercase, 'Lowercase')}
									{@render passwordStrengthIndicator(passwordStrength.hasUppercase, 'Uppercase')}
									{@render passwordStrengthIndicator(passwordStrength.hasNumber, 'Number')}
									{@render passwordStrengthIndicator(passwordStrength.hasSpecial, 'Special')}
									{@render passwordStrengthIndicator(
										passwordStrength.score >= 3,
										'At least good or better',
										true
									)}
								</div>
							</div>

							{#if passwordStrength.feedback.length > 0}
								<div>
									<div class="mb-2 text-sm font-medium">Suggestions</div>
									<ul class="text-muted-foreground ml-4 list-disc space-y-1 text-xs">
										{#each passwordStrength.feedback as suggestion}
											<li>
												{suggestion}
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>
		</div>
	{/if}
</div>
