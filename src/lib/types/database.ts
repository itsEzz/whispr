export interface EventSchedulerStatus {
	status: string;
}

export interface InformationSchemaEvents {
	EVENT_DEFINITION?: string | null;
	EVENT_TYPE?: string | null;
	INTERVAL_VALUE?: string | null;
	INTERVAL_FIELD?: string | null;
	STARTS?: string | null;
	ON_COMPLETION?: string | null;
	EVENT_COMMENT?: string | null;
}

export type EventSchedulerResult = 'OK' | 'NOT_OK' | 'ERROR';
