export interface EncryptionMessage {
	type: 'encrypt' | 'decrypt';
	data: string;
	password: string;
}

export interface EncryptionResponse {
	success: boolean;
	result?: string;
	error?: string;
}
