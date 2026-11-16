// Un chemin du disque des médias, sans le « /data/ » que voient les conteneurs : « medias/movies/Ça (2017)/ca.mkv »
export function formatStoragePath(filePath: string): string {
	return filePath.replace(/^\/data\//, "");
}
