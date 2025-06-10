import { browser } from '$app/environment';
import { isSuccess, tc } from '@itsezz/try-catch';

/**
 * Helper function to download a file
 * @param content Content to download (text or data URL)
 * @param filename Name for the downloaded file
 * @returns Boolean indicating success
 */
export function downloadFile(content: string, filename: string): boolean {
	if (!browser) return false;

	const url =
		content.startsWith('data:') || content.startsWith('http')
			? content
			: URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));

	const result = tc(() => {
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	});

	if (url.startsWith('blob:')) {
		setTimeout(() => URL.revokeObjectURL(url), 100);
	}

	return isSuccess(result);
}
