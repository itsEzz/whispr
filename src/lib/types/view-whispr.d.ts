export interface ViewWhispr {
	id: string;
	content: string;
	views?: number;
	unlimitedViews?: boolean;
	expiresAt?: Date | string;
	showCopyButton?: boolean;
	showDownloadButton?: boolean;
}
