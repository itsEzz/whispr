<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { type ViewPasswordSchema } from '$lib/schemas/view-schema';
	import { cn } from '$lib/utils';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import LockOpen from '@lucide/svelte/icons/lock-open';
	import type { Infer, SuperForm } from 'sveltekit-superforms';
	import FormError from '../common/form-error.svelte';

	// Props
	interface Props {
		form: SuperForm<Infer<ViewPasswordSchema>>;
		loading: boolean;
		disabled?: boolean;
	}

	let { form, loading, disabled = false }: Props = $props();

	// Variables & States
	// svelte-ignore state_referenced_locally
	const { form: formData, errors, enhance, constraints, submitting, allErrors, submit } = form;
	let showPassword = $state<boolean>(false);
	let isFormValid = $derived($allErrors.length === 0);

	// Handler Functions
	function handleTogglePasswordVisibility() {
		showPassword = !showPassword;
	}
</script>

<div class="mt-12 flex justify-center sm:mt-16 md:mt-20">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title>
				<div class="flex items-center">
					<LockOpen class="mr-2" aria-hidden="true" /> Decrypt Whispr
				</div>
			</Card.Title>
			<Card.Description>Enter the password to unlock this Whispr.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form use:enhance autocomplete="off">
				<Form.Field {form} name="password">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>
								{#if loading}
									<Skeleton class="h-3.5 w-16" />
								{:else}
									Password
								{/if}
							</Form.Label>
							<div class="flex flex-row gap-2">
								{#if loading}
									<Skeleton class="h-9 w-full" />
									<Skeleton class="h-9 w-10" />
								{:else}
									<Input
										{...props}
										{...$constraints.password}
										bind:value={$formData.password}
										disabled={$submitting || disabled}
										type={showPassword ? 'text' : 'password'}
										placeholder="Enter password"
										aria-describedby={$errors.password ? 'password-error' : undefined}
										class={cn(
											$errors.password && 'border-destructive focus-visible:ring-destructive/50'
										)}
									/>
									<div>
										<Button
											disabled={$submitting || disabled}
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
											<span class="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span
											>
										</Button>
									</div>
								{/if}
							</div>
						{/snippet}
					</Form.Control>
					{#if !loading}<FormError errors={$errors.password} id="password-error" />{/if}
				</Form.Field>
			</form>
		</Card.Content>
		<Card.Footer class="justify-end">
			{#if loading}
				<Skeleton class="h-9 w-36" />
			{:else}
				<Form.Button
					disabled={$submitting || !isFormValid || loading || disabled}
					aria-label={$submitting ? 'Decrypting Whispr...' : 'Decrypt Whispr'}
					onclick={submit}
				>
					{#if $submitting || loading}
						Decrypting Whispr...
						<LoaderCircle class="animate-spin" aria-hidden="true" />
					{:else}
						Decrypt Whispr
						<LockOpen aria-hidden="true" />
					{/if}
				</Form.Button>
			{/if}
		</Card.Footer>
	</Card.Root>
</div>
