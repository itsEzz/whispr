import { browser } from '$app/environment';
import { isError, tryCatch } from '@itsezz/try-catch';
import QRCode from 'qrcode';
import { downloadFile } from './download';

/**
 * Generates a QR code as PNG and triggers download
 * @param text Content to encode in the QR code
 * @returns Promise resolving to success status
 */
export async function qrCodeToPng(text: string): Promise<boolean> {
	const dataUrl = await tryCatch(QRCode.toDataURL(text));

	if (isError(dataUrl)) return false;

	return await downloadFile(dataUrl.data, 'whispr-qr.png');
}

/**
 * Generates a QR code as SVG and triggers download
 * @param text Content to encode in the QR code
 * @returns Promise resolving to success status
 */
export async function qrCodeToSvg(text: string): Promise<boolean> {
	if (!browser) return false;

	const svgString = await getSvgString(text);
	if (!svgString) return false;

	const blob = new Blob([svgString], { type: 'image/svg+xml' });
	const url = URL.createObjectURL(blob);

	const downloadResult = await downloadFile(url, 'whispr-qr.svg');
	URL.revokeObjectURL(url);

	return downloadResult;
}

/**
 * Generates a QR code as SVG string
 * @param text Content to encode in the QR code
 * @returns Promise resolving to SVG string or null if failed
 */
export async function getSvgString(text: string): Promise<string | null> {
	const svgString = await tryCatch(
		QRCode.toString(text, {
			type: 'svg'
		})
	);

	return isError(svgString) ? null : svgString.data;
}
