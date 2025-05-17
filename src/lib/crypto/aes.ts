import { Base64 } from 'js-base64';
import pako from 'pako';

class AES {
	private readonly SALT_LENGTH = 16;
	private readonly IV_LENGTH = 12;
	private readonly ITERATIONS = 1000000;
	private readonly COMPRESSION_MIN_LENGTH = 150;

	private async generateKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
		const encoder = new TextEncoder();
		const passwordBuffer = encoder.encode(password);

		const keyMaterial = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, [
			'deriveKey'
		]);

		return crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt,
				iterations: this.ITERATIONS,
				hash: 'SHA-256'
			},
			keyMaterial,
			{ name: 'AES-GCM', length: 256 },
			false,
			['encrypt', 'decrypt']
		);
	}

	async encrypt(plaintext: string, password: string): Promise<string> {
		const encoder = new TextEncoder();
		const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
		const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

		const key = await this.generateKey(password, salt);

		const isCompressed = plaintext.length > this.COMPRESSION_MIN_LENGTH;
		const compressionFlag = new Uint8Array([isCompressed ? 1 : 0]);

		const plaintextBuffer = isCompressed
			? pako.deflate(encoder.encode(plaintext))
			: encoder.encode(plaintext);

		const encrypted = await crypto.subtle.encrypt(
			{
				name: 'AES-GCM',
				iv
			},
			key,
			plaintextBuffer
		);

		const combined = new Uint8Array(
			salt.length + iv.length + compressionFlag.length + encrypted.byteLength
		);
		combined.set(salt, 0);
		combined.set(iv, salt.length);
		combined.set(compressionFlag, salt.length + iv.length);
		combined.set(new Uint8Array(encrypted), salt.length + iv.length + compressionFlag.length);

		return Base64.fromUint8Array(combined);
	}

	async decrypt(ciphertext: string, password: string): Promise<string> {
		const decoder = new TextDecoder();
		const combined = Base64.toUint8Array(ciphertext);

		const salt = combined.slice(0, this.SALT_LENGTH);
		const iv = combined.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
		const compressionFlag = combined[this.SALT_LENGTH + this.IV_LENGTH];
		const encrypted = combined.slice(this.SALT_LENGTH + this.IV_LENGTH + 1);

		const key = await this.generateKey(password, salt);

		const decrypted = await crypto.subtle.decrypt(
			{
				name: 'AES-GCM',
				iv
			},
			key,
			encrypted
		);

		const decryptedBuffer = new Uint8Array(decrypted);
		return decoder.decode(compressionFlag === 1 ? pako.inflate(decryptedBuffer) : decryptedBuffer);
	}
}

export default new AES();
