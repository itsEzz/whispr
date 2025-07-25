export interface TtlPreset {
	label: string;
	value: number;
	unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
}

export interface TtlUnits {
	minutes: number;
	hours: number;
	days: number;
	weeks: number;
	months: number;
}
