// Ce que la console lit d'une session de GET /Sessions (le reste est ignoré)
export type JellyfinSession = {
	UserName?: string;
	Client?: string;
	DeviceName?: string;
	NowPlayingItem?: {
		Name?: string;
		SeriesName?: string;
		RunTimeTicks?: number;
	};
	PlayState?: {
		PositionTicks?: number;
		IsPaused?: boolean;
		PlayMethod?: string;
	};
};
