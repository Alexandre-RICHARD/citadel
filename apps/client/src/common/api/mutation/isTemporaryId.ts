// Élément pas encore confirmé par le serveur : l'UI le grise et désactive ses actions
export function isTemporaryId(id: number): boolean {
	return id < 0;
}
