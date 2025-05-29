import { browser } from '$app/environment';
import { isSuccess, tryCatch } from '@itsezz/try-catch';

/**
 * Helper function to download a file
 * @param urlOrData URL or data URL of the file
 * @param filename Name for the downloaded file
 * @returns Promise resolving to success status
 */
export async function downloadFile(urlOrData: string, filename: string): Promise<boolean> {
	if (!browser) return false;

	const result = tryCatch(() => {
		const link = document.createElement('a');
		link.href = urlOrData;
		link.download = filename;
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	});

	return isSuccess(result);
}
