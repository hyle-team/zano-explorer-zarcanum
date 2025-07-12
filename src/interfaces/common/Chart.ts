export interface ChartPoint {
	at: string;
	[key: string]: string | number;
}

export interface DifficultyData {
	at: string;
	d: string;
}

export interface HashRateData {
	at: string;
	h100: string;
	h400: string;
	d120: string;
}
