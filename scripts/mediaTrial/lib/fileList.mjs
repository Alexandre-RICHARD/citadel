// La liste des fichiers du NAS, produite par une seule commande find (voir scripts/mediaTrial.sh) :
// une ligne par fichier, « inode <tab> taille <tab> nombre de liens <tab> chemin ».
import fs from "node:fs";
import readline from "node:readline";

export const hostDataRoot = "/Volume2/data";
export const folders = {
	movies: `${hostDataRoot}/medias/movies/`,
	moviesArchives: `${hostDataRoot}/medias/movies_archives/`,
	series: `${hostDataRoot}/medias/series/`,
	torrents: `${hostDataRoot}/torrents/`,
	otherTorrents: `${hostDataRoot}/torrents/other/`,
};

// qBittorrent, Radarr, Sonarr et Jellyfin voient /Volume2/data sous /data (compose.yml)
export function toHostPath(containerPath) {
	if (!containerPath) return undefined;
	const normalized = containerPath.replace(/\\/g, "/");
	return normalized.startsWith("/data/") ? `${hostDataRoot}${normalized.slice("/data".length)}` : normalized;
}

// Chaque fichier est rangé sous tous ses dossiers parents : « tout ce qui est sous ce dossier » se lit sans parcourir la liste
function addToAncestors(byFolder, entry) {
	let end = entry.path.lastIndexOf("/");
	while (end > 0) {
		const folder = entry.path.slice(0, end + 1);
		if (!byFolder.has(folder)) byFolder.set(folder, []);
		byFolder.get(folder).push(entry);
		end = entry.path.lastIndexOf("/", end - 1);
	}
}

export async function readFileList(file) {
	const byPath = new Map();
	const byFolder = new Map();
	const pathsByInode = new Map();
	const lines = readline.createInterface({ input: fs.createReadStream(file, "utf8"), crlfDelay: Infinity });
	for await (const line of lines) {
		const [inode, size, links, ...pathParts] = line.split("\t");
		if (!pathParts.length) continue;
		const entry = { inode, size: Number(size), links: Number(links), path: pathParts.join("\t") };
		byPath.set(entry.path, entry);
		addToAncestors(byFolder, entry);
		if (!pathsByInode.has(inode)) pathsByInode.set(inode, []);
		pathsByInode.get(inode).push(entry.path);
	}
	return {
		byPath,
		pathsByInode,
		get: (hostPath) => byPath.get(hostPath),
		under: (folder) => byFolder.get(folder.endsWith("/") ? folder : `${folder}/`) ?? [],
	};
}

export function parentFolder(filePath) {
	return filePath.slice(0, filePath.lastIndexOf("/") + 1);
}

// Premier dossier sous un dossier racine : le dossier du film ou de la série
export function topFolder(filePath, root) {
	return filePath.slice(root.length).split("/")[0];
}

// Le dossier du film ou de la série qui contient ce chemin, sous movies, movies_archives ou series
export function libraryFolderOf(hostPath) {
	const root = [folders.movies, folders.moviesArchives, folders.series].find((candidate) => hostPath?.startsWith(candidate));
	return root ? `${root}${topFolder(hostPath, root)}` : undefined;
}
