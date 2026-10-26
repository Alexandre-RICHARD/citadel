// Plateformes IGDB telles que la passerelle les rend ; PS2 et PS3 sont déjà en base (migration)
export const IGDB_PLATFORMS = {
	PS2: { id: 8, name: "PlayStation 2", abbreviation: "PS2", slug: "ps2" },
	PS3: { id: 9, name: "PlayStation 3", abbreviation: "PS3", slug: "ps3" },
} as const;
