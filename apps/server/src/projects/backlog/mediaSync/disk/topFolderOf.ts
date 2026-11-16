// Le dossier du film ou de la série qui contient ce chemin, sous un dossier racine (« /data/medias/movies/ ») ; null hors
// de ce dossier, ou pour un fichier posé directement dedans
export function topFolderOf(filePath: string, root: string): string | null {
	if (!filePath.startsWith(root)) return null;
	const name = filePath.slice(root.length).split("/").at(0) ?? "";
	return name === "" || name === filePath.slice(root.length)
		? null
		: `${root}${name}`;
}
