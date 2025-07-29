import { browser } from '$app/environment';

class AESWorkerService {
	private worker: Worker | null = null;

	constructor() {
		if (browser) {
			this.worker = new Worker(new URL('../workers/encryption-worker.ts', import.meta.url), {
				type: 'module'
			});
		}
	}

	private async performOperation(
		type: 'encrypt' | 'decrypt',
		data: string,
		password: string
	): Promise<string> {
		if (!this.worker) throw new Error('Encryption worker not available');

		return new Promise<string>((resolve, reject) => {
			if (!this.worker) {
				reject(new Error('Encryption worker not available'));
				return;
			}

			const worker = this.worker;

			const handleMessage = (event: MessageEvent) => {
				const { success, result, error } = event.data;
				worker.removeEventListener('message', handleMessage);
				worker.removeEventListener('error', handleError);

				if (success) {
					resolve(result);
				} else {
					reject(new Error(error || 'Encryption failed'));
				}
			};

			const handleError = () => {
				worker.removeEventListener('message', handleMessage);
				worker.removeEventListener('error', handleError);
				reject(new Error('Worker error'));
			};

			worker.addEventListener('message', handleMessage);
			worker.addEventListener('error', handleError);

			worker.postMessage({
				type,
				data,
				password
			});
		});
	}

	async encrypt(plaintext: string, password: string): Promise<string> {
		return await this.performOperation('encrypt', plaintext, password);
	}

	async decrypt(ciphertext: string, password: string): Promise<string> {
		return await this.performOperation('decrypt', ciphertext, password);
	}
}

export default new AESWorkerService();
