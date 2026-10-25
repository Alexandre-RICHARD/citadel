// Une IP parmi les plus actives de la période
export type IpActivity = {
	ip: string;
	country: string | null;
	requestCount: number;
	// Dont requêtes de scan (§14.3, fonctionnalité 6)
	scanCount: number;
};
