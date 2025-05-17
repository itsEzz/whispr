export interface CreatedWhispr {
	id: string;
	deleteId: string;
	views: number;
	showViews: boolean;
	unlimitedViews: boolean;
	expiresAt: Date | string;
	showExpiresAt: boolean;
	showCopyButton: boolean;
	showDownloadButton: boolean;
}
