<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { passwordGenerator } from '$lib/crypto/pw-gen';
	import { cn } from '$lib/utils';
	import { Dices, Eye, EyeOff, LoaderCircle } from 'lucide-svelte';
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

	// Handler Functions
	function handleTogglePasswordVisibility() {
		showPassword = !showPassword;
	}

	async function handleGeneratePassword() {
		loading = true;
		try {
			password = passwordGenerator.generate(30);
			toast.success('Password generated', {
				description: 'A secure password has been generated for you. Please take note of it.'
			});

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
			placeholder="Enter a secure password"
			min={1}
			max={1000}
			class={cn(
				!validationResult.success && 'border-destructive focus-visible:ring-destructive/50'
			)}
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
</div>
