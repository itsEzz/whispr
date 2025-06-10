import { browser } from '$app/environment';
import { isError, tca } from '@itsezz/try-catch';
import QRCode from 'qrcode';
import { downloadFile } from './download';

/**
 * Generates a QR code as PNG and triggers download
 * @param text Content to encode in the QR code
 * @param whisprId Optional identifier for the QR code, used in the filename
 * @returns Promise resolving to success status
 */
export async function qrCodeToPng(text: string, whisprId?: string): Promise<boolean> {
	const dataUrl = await tca(QRCode.toDataURL(text));

	if (isError(dataUrl)) return false;

	const fileName = whisprId ? `whispr-${whisprId}-qr.png` : 'whispr-qr.png';

	return downloadFile(dataUrl.data, fileName);
}

/**
 * Generates a QR code as SVG and triggers download
 * @param text Content to encode in the QR code
 * @param whisprId Optional identifier for the QR code, used in the filename
 * @returns Promise resolving to success status
 */
export async function qrCodeToSvg(text: string, whisprId?: string): Promise<boolean> {
	if (!browser) return false;

	const svgString = await getSvgString(text);
	if (!svgString) return false;

	const blob = new Blob([svgString], { type: 'image/svg+xml' });
	const url = URL.createObjectURL(blob);

	const fileName = whisprId ? `whispr-${whisprId}-qr.png` : 'whispr-qr.png';

	const downloadResult = downloadFile(url, fileName);
	URL.revokeObjectURL(url);

	return downloadResult;
}

/**
 * Generates a QR code as SVG string
 * @param text Content to encode in the QR code
 * @returns Promise resolving to SVG string or null if failed
 */
export async function getSvgString(text: string): Promise<string | null> {
	const svgString = await tca(
		QRCode.toString(text, {
			type: 'svg'
		})
	);

	return isError(svgString) ? null : svgString.data;
}
