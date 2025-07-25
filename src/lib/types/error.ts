import type { Component } from 'svelte';

export interface ErrorPageConfig {
	seo: {
		title: string;
		description: string;
	};
	icon: Component;
	iconClass?: string;
	title: string;
	description: string;
}
