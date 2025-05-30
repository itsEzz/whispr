<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { type ViewPasswordSchema } from '$lib/schemas/view-schema';
	import { cn } from '$lib/utils';
	import { Eye, EyeOff, LoaderCircle, LockOpen } from 'lucide-svelte';
	import type { Infer, SuperForm } from 'sveltekit-superforms';
	import FormError from '../common/form-error.svelte';

	// Props
	interface Props {
		form: SuperForm<Infer<ViewPasswordSchema>>;
	}

	let { form }: Props = $props();

	// Variables & States
	const { form: formData, errors, enhance, constraints, submitting, allErrors } = form;
	let showPassword = $state<boolean>(false);
	let isFormValid = $derived($allErrors.length === 0);

	// Handler Functions
	function handleTogglePasswordVisibility() {
		showPassword = !showPassword;
	}
</script>

<div class="container mx-auto flex h-full flex-col overflow-hidden p-4">
	<div class="mt-12 flex justify-center sm:mt-16 md:mt-20">
		<form method="POST" use:enhance autocomplete="off">
			<Card.Root class="w-full max-w-md">
				<Card.Header>
					<Card.Title>
						<div class="flex items-center">
							<LockOpen class="mr-2" aria-hidden="true" /> Decrypt Whispr
						</div>
					</Card.Title>
					<Card.Description>
						Provide the password to reveal the contents of this secure Whispr.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<Form.Field {form} name="password">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Password</Form.Label>
								<div class="flex flex-row gap-2">
									<Input
										{...props}
										{...$constraints.password}
										bind:value={$formData.password}
										disabled={$submitting}
										type={showPassword ? 'text' : 'password'}
										placeholder="Enter password"
										aria-describedby={$errors.password ? 'password-error' : undefined}
										class={cn(
											$errors.password && 'border-destructive focus-visible:ring-destructive/50'
										)}
									/>
									<div>
										<Button
											disabled={$submitting}
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
								</div>
							{/snippet}
						</Form.Control>
						<FormError errors={$errors.password} id="password-error" />
					</Form.Field>
				</Card.Content>
				<Card.Footer class="justify-end">
					<Form.Button
						disabled={$submitting || !isFormValid}
						aria-label={$submitting ? 'Decrypting Whispr...' : 'Decrypt Whispr'}
					>
						{#if $submitting}
							Decrypting Whispr...
							<LoaderCircle class="animate-spin" aria-hidden="true" />
						{:else}
							Decrypt Whispr
							<LockOpen aria-hidden="true" />
						{/if}
					</Form.Button>
				</Card.Footer>
			</Card.Root>
		</form>
	</div>
</div>
