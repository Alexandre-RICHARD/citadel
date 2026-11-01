// Une IP parmi les plus actives de la période
export type IpActivity = {
	ip: string;
	country: string | null;
	requestCount: number;
	// Dont requêtes de scan
	scanCount: number;
};
