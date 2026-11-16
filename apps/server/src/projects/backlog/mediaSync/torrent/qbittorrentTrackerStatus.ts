// Le status d'une adresse de tracker dans qBittorrent (API WebUI v2), un nombre
export const QBITTORRENT_TRACKER_STATUS = {
	DISABLED: 0,
	NOT_CONTACTED: 1,
	WORKING: 2,
	UPDATING: 3,
	NOT_WORKING: 4,
} as const;
