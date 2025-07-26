import { browser } from '$app/environment';
import { clientAppConfig } from './client-app-config';

/**
 * Gets the base URL for the application.
 *
 * Prioritizes the PUBLIC_BASE_URL environment variable for consistent SEO URLs
 * in production, with a fallback to the browser's current location for development.
 *
 * @returns {string} The base URL (e.g., "https://example.com") or empty string if unavailable
 */
export function getBaseUrl(): string {
	// Try to get from environment variable for consistent SEO URLs
	if (clientAppConfig.PUBLIC_BASE_URL) {
		return clientAppConfig.PUBLIC_BASE_URL;
	}

	// Fallback to browser location for development/local testing
	if (browser && typeof window !== 'undefined') {
		return `${window.location.protocol}//${window.location.host}`;
	}

	return '';
}

/**
 * Constructs a full URL by combining the base URL with a given path.
 *
 * Uses getBaseUrl() to determine the base URL and appends the provided path.
 * Automatically handles path formatting (adds leading slash if missing).
 *
 * @param {string} path - The path to append to the base URL (e.g., "/view", "about")
 * @returns {string} The complete URL or empty string if base URL is unavailable
 */
export function getFullUrl(path: string): string {
	const base = getBaseUrl();
	if (!base) return '';
	return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
