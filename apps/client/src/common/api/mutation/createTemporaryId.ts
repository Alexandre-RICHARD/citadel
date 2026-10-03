let lastTemporaryId = 0;

// Id d'un élément créé de façon optimiste, en attendant celui du serveur : négatif, il ne peut pas être un vrai id
export function createTemporaryId(): number {
	lastTemporaryId -= 1;
	return lastTemporaryId;
}
