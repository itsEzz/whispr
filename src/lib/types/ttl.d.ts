export interface TtlPreset {
	label: string;
	value: number;
	unit: 'minutes' | 'hours' | 'days';
}

export interface TtlUnits {
	minutes: number;
	hours: number;
	days: number;
}
