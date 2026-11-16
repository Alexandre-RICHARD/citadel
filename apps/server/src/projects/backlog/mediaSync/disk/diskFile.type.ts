// Un fichier du disque des médias : son chemin (tel que les outils le voient, sous /data), son inode et sa taille.
// Deux noms d'un même fichier (liens physiques entre medias/ et torrents/) partagent l'inode
export type DiskFile = {
	path: string;
	inode: number;
	sizeBytes: number;
};
