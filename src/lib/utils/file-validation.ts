/**
 * Allowed MIME types for text files.
 * Includes standard text types and application types that represent text-based content.
 */
export const TEXT_MIME_TYPES = [
	'text/plain',
	'text/html',
	'text/css',
	'text/javascript',
	'text/typescript',
	'text/markdown',
	'text/xml',
	'text/csv',
	'text/tab-separated-values',
	'application/json',
	'application/xml',
	'application/javascript',
	'application/typescript',
	'application/x-yaml',
	'application/yaml',
	'application/sql',
	'application/x-sh',
	'application/x-shellscript',
	'application/x-python',
	'application/x-ruby',
	'application/x-perl',
	'application/x-php',
	'application/toml',
	'application/x-httpd-php',
	'application/x-java',
	'application/x-c',
	'application/x-c++',
	'application/x-csharp',
	'application/x-go',
	'application/x-rust',
	'application/x-swift',
	'application/x-kotlin',
	'application/x-scala',
	'application/x-lua',
	'application/x-r',
	'application/x-dart'
];

/**
 * Allowed file extensions for text files.
 * Includes common programming languages, configuration files, and text-based formats.
 */
export const TEXT_EXTENSIONS = [
	'.txt',
	'.md',
	'.markdown',
	'.json',
	'.xml',
	'.html',
	'.htm',
	'.css',
	'.js',
	'.ts',
	'.jsx',
	'.tsx',
	'.py',
	'.java',
	'.cpp',
	'.c',
	'.h',
	'.hpp',
	'.php',
	'.rb',
	'.go',
	'.rs',
	'.sh',
	'.bash',
	'.zsh',
	'.fish',
	'.ps1',
	'.bat',
	'.cmd',
	'.yml',
	'.yaml',
	'.toml',
	'.ini',
	'.conf',
	'.config',
	'.env',
	'.log',
	'.csv',
	'.tsv',
	'.sql',
	'.r',
	'.scala',
	'.kt',
	'.swift',
	'.dart',
	'.lua',
	'.pl',
	'.pm',
	'.tcl',
	'.vim',
	'.gitignore',
	'.gitattributes',
	'.dockerfile',
	'.makefile',
	'.cmake',
	'.gradle',
	'.properties',
	'.lock',
	'.mod',
	'.sum',
	'.editorconfig',
	'.prettierrc',
	'.eslintrc',
	'.babelrc',
	'.npmrc',
	'.yarnrc',
	'.nvmrc',
	'.htaccess',
	'.htpasswd',
	'.gitconfig',
	'.bashrc',
	'.zshrc',
	'.vimrc',
	'.emacs',
	'.profile',
	'.bash_profile',
	'.bash_aliases',
	'.inputrc',
	'.screenrc',
	'.tmux.conf',
	'.curlrc',
	'.wgetrc',
	'.netrc',
	'.mailrc',
	'.muttrc',
	'.lynxrc',
	'.Xresources',
	'.Xdefaults',
	'.xinitrc',
	'.xprofile'
];

/**
 * Validates if a file is a text file based on MIME type and file extension.
 *
 * @param file - The File object to validate
 * @returns Object containing validation result and optional error reason
 * @returns {boolean} isValid - Whether the file passes basic text file validation
 * @returns {string} [reason] - Error message if validation fails
 */
export function isTextFile(file: File): { isValid: boolean; reason?: string } {
	// Check MIME type
	if (file.type && !TEXT_MIME_TYPES.includes(file.type) && !file.type.startsWith('text/')) {
		return { isValid: false, reason: `File type '${file.type}' is not allowed.` };
	}

	// Check file extension
	const fileName = file.name.toLowerCase();
	const hasValidExtension = TEXT_EXTENSIONS.some((ext) => fileName.endsWith(ext));

	// If no MIME type is provided, rely on extension
	if (!file.type && !hasValidExtension) {
		return { isValid: false, reason: 'File extension is not allowed.' };
	}

	return { isValid: true };
}

/**
 * Analyzes the content of a file to determine if it contains binary data.
 * Checks for null bytes and control characters that indicate binary content.
 *
 * @param content - ArrayBuffer containing the file content to analyze
 * @returns True if the content appears to be binary, false if it appears to be text
 */
export function isBinaryContent(content: ArrayBuffer): boolean {
	const uint8Array = new Uint8Array(content);
	const sampleSize = Math.min(8192, uint8Array.length); // Check first 8KB

	let nullBytes = 0;
	let controlChars = 0;

	for (let i = 0; i < sampleSize; i++) {
		const byte = uint8Array[i];

		// Count null bytes
		if (byte === 0) {
			nullBytes++;
		}

		// Count control characters (except common ones like tab, newline, carriage return)
		if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
			controlChars++;
		}
	}

	// If more than 1% null bytes or 5% control characters, likely binary
	const nullByteRatio = nullBytes / sampleSize;
	const controlCharRatio = controlChars / sampleSize;

	return nullByteRatio > 0.01 || controlCharRatio > 0.05;
}

/**
 * Validates a file by checking its type, extension, and content.
 *
 * @param file - The File object to validate
 * @returns Promise resolving to validation result
 * @returns {boolean} isValid - Whether the file passes all validation checks
 * @returns {string} [reason] - Error message if validation fails
 */
export async function validateTextFile(file: File): Promise<{ isValid: boolean; reason?: string }> {
	const basicCheck = isTextFile(file);
	if (!basicCheck.isValid) {
		return basicCheck;
	}

	return new Promise((resolve) => {
		const reader = new FileReader();
		const slice = file.slice(0, 8192); // Read first 8KB

		reader.onload = (e) => {
			const arrayBuffer = e.target?.result as ArrayBuffer;
			if (isBinaryContent(arrayBuffer)) {
				resolve({
					isValid: false,
					reason: 'File semms to contains binary content which is not allowed.'
				});
			} else {
				resolve({ isValid: true });
			}
		};

		reader.onerror = () => {
			resolve({ isValid: false, reason: 'File validation failed.' });
		};

		reader.readAsArrayBuffer(slice);
	});
}

/**
 * Returns the accept attribute value for file inputs.
 *
 * @returns Comma-separated string of file extensions and MIME types
 */
export function getAcceptAttribute(): string {
	return TEXT_EXTENSIONS.join(',') + ',' + TEXT_MIME_TYPES.join(',');
}
