// Un appareil de ton tailnet, vu par le NAS
export type TailscaleDevice = {
	name: string;
	os: string;
	online: boolean;
	// Liaison directe avec le NAS ; false : par un relais de Tailscale (plus lent)
	direct: boolean;
	// Date ISO de sa dernière connexion ; null s'il est en ligne ou jamais vu
	lastSeen: string | null;
};
