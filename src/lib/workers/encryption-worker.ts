import type { EncryptionMessage, EncryptionResponse } from '$lib/types/encryption';
import { isError, tc, tca } from '@itsezz/try-catch';
import { scrypt } from '@noble/hashes/scrypt.js';
import { Base64 } from 'js-base64';
import pako from 'pako';

class CryptoError extends Error {
	constructor(
		message: string,
		public code: string
	) {
		super(message);
		this.name = 'CryptoError';
	}
}

const ErrorCodes = {
	DATA_TOO_LARGE: 'DATA_TOO_LARGE',
	DATA_TOO_LARGE_COMPRESSED: 'DATA_TOO_LARGE_COMPRESSED',
	INVALID_FORMAT: 'INVALID_FORMAT',
	CRYPTO_FAILED: 'CRYPTO_FAILED'
} as const;

class WorkerAES {
	private readonly CURRENT_VERSION = 1;
	private readonly SUPPORTED_VERSIONS = [1];
	private readonly SALT_LENGTH = 32;
	private readonly IV_LENGTH = 12;
	private readonly SCRYPT_N = 16384;
	private readonly SCRYPT_R = 8;
	private readonly SCRYPT_P = 1;
	private readonly COMPRESSION_MIN_LENGTH = 150;
	private readonly MAX_PLAINTEXT_SIZE = 15 * 1024 * 1024;
	private readonly MAX_COMPRESSED_SIZE = 12 * 1024 * 1024;
	private readonly MIN_CIPHERTEXT_LENGTH = 1 + this.SALT_LENGTH + this.IV_LENGTH + 1 + 16;

	private validateInput(plaintext: string, password: string): void {
		if (!password || typeof password !== 'string')
			throw new CryptoError('Invalid password', ErrorCodes.INVALID_FORMAT);

		if (typeof plaintext !== 'string')
			throw new CryptoError('Invalid data format', ErrorCodes.INVALID_FORMAT);

		const plaintextBytes = new TextEncoder().encode(plaintext).length;
		if (plaintextBytes > this.MAX_PLAINTEXT_SIZE)
			throw new CryptoError('Data too large to encrypt', ErrorCodes.DATA_TOO_LARGE);
	}

	private validateCiphertext(ciphertext: string): Uint8Array {
		if (!ciphertext || typeof ciphertext !== 'string')
			throw new CryptoError('Invalid data format', ErrorCodes.INVALID_FORMAT);

		const result = tc(() => {
			const combined = Base64.toUint8Array(ciphertext);
			if (combined.length < this.MIN_CIPHERTEXT_LENGTH)
				throw new CryptoError('Invalid data format', ErrorCodes.INVALID_FORMAT);

			const version = combined[0];
			if (!this.SUPPORTED_VERSIONS.includes(version))
				throw new CryptoError('Unable to process data', ErrorCodes.CRYPTO_FAILED);

			return combined;
		});

		if (isError(result)) throw new CryptoError('Unable to process data', ErrorCodes.CRYPTO_FAILED);

		return result.data;
	}

	private async generateKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
		const encoder = new TextEncoder();
		const passwordBuffer = encoder.encode(password);

		const derivedKey = scrypt(passwordBuffer, salt, {
			N: this.SCRYPT_N,
			r: this.SCRYPT_R,
			p: this.SCRYPT_P,
			dkLen: 32
		});

		return await crypto.subtle.importKey(
			'raw',
			new Uint8Array(derivedKey),
			{ name: 'AES-GCM' },
			false,
			['encrypt', 'decrypt']
		);
	}

	async encrypt(plaintext: string, password: string): Promise<string> {
		const result = await tca(async () => {
			this.validateInput(plaintext, password);

			const encoder = new TextEncoder();
			const versionByte = new Uint8Array([this.CURRENT_VERSION]);
			const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
			const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

			const key = await this.generateKey(password, salt);

			const isCompressed = plaintext.length > this.COMPRESSION_MIN_LENGTH;
			const compressionFlag = new Uint8Array([isCompressed ? 1 : 0]);

			const plaintextBuffer = isCompressed
				? pako.deflate(encoder.encode(plaintext))
				: encoder.encode(plaintext);

			if (isCompressed && plaintextBuffer.length > this.MAX_COMPRESSED_SIZE)
				throw new CryptoError(
					'Data too large after processing',
					ErrorCodes.DATA_TOO_LARGE_COMPRESSED
				);

			const encrypted = await crypto.subtle.encrypt(
				{
					name: 'AES-GCM',
					iv
				},
				key,
				plaintextBuffer
			);

			const combined = new Uint8Array(
				versionByte.length + salt.length + iv.length + compressionFlag.length + encrypted.byteLength
			);
			combined.set(versionByte, 0);
			combined.set(salt, versionByte.length);
			combined.set(iv, versionByte.length + salt.length);
			combined.set(compressionFlag, versionByte.length + salt.length + iv.length);
			combined.set(
				new Uint8Array(encrypted),
				versionByte.length + salt.length + iv.length + compressionFlag.length
			);

			return Base64.fromUint8Array(combined);
		});

		if (isError(result)) {
			if (
				result.error instanceof CryptoError &&
				(result.error.code === ErrorCodes.DATA_TOO_LARGE ||
					result.error.code === ErrorCodes.DATA_TOO_LARGE_COMPRESSED)
			)
				throw result.error;

			throw new CryptoError('Unable to process data', ErrorCodes.CRYPTO_FAILED);
		}

		return result.data;
	}

	async decrypt(ciphertext: string, password: string): Promise<string> {
		const result = await tca(async () => {
			const combined = this.validateCiphertext(ciphertext);
			return await this.decryptV1(combined, password);
		});

		if (isError(result)) {
			if (
				result.error instanceof CryptoError &&
				(result.error.code === ErrorCodes.INVALID_FORMAT ||
					result.error.code === ErrorCodes.CRYPTO_FAILED)
			)
				throw result.error;

			throw new CryptoError('Unable to process data', ErrorCodes.CRYPTO_FAILED);
		}

		return result.data;
	}

	private async decryptV1(combined: Uint8Array, password: string): Promise<string> {
		const result = await tca(async () => {
			const decoder = new TextDecoder();

			const versionOffset = 1;
			const salt = combined.slice(versionOffset, versionOffset + this.SALT_LENGTH);
			const iv = combined.slice(
				versionOffset + this.SALT_LENGTH,
				versionOffset + this.SALT_LENGTH + this.IV_LENGTH
			);
			const compressionFlag = combined[versionOffset + this.SALT_LENGTH + this.IV_LENGTH];
			const encrypted = combined.slice(versionOffset + this.SALT_LENGTH + this.IV_LENGTH + 1);

			if (compressionFlag !== 0 && compressionFlag !== 1)
				throw new CryptoError('Invalid data format', ErrorCodes.INVALID_FORMAT);

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

			return decoder.decode(
				compressionFlag === 1 ? pako.inflate(decryptedBuffer) : decryptedBuffer
			);
		});

		if (isError(result)) throw new CryptoError('Unable to process data', ErrorCodes.CRYPTO_FAILED);

		return result.data;
	}
}

const workerAES = new WorkerAES();

self.onmessage = async (event: MessageEvent<EncryptionMessage>) => {
	const { type, data, password } = event.data;

	const result = await tca(async () => {
		if (type === 'encrypt') return await workerAES.encrypt(data, password);
		else if (type === 'decrypt') return await workerAES.decrypt(data, password);
		else throw new Error('Invalid message type');
	});

	if (isError(result)) {
		const response: EncryptionResponse = {
			success: false,
			error: result.error instanceof Error ? result.error.message : 'Unknown error'
		};
		self.postMessage(response);
	} else {
		const response: EncryptionResponse = {
			success: true,
			result: result.data
		};
		self.postMessage(response);
	}
};
