// Coût d'un hash argon2id : mémoire en Kio, nombre de passes, fils de calcul
export type Argon2Parameters = {
	memoryKib: number;
	passes: number;
	parallelism: number;
};
