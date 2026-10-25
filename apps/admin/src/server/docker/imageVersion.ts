// La version d'une image, d'après son nom : « lscr.io/linuxserver/radarr:6.1.1.10360-ls297 »
// donne « 6.1.1.10360-ls297 ». Le « : » d'un port de registre (« registre:5000/image ») est
// avant le dernier « / » : ce n'est pas un tag.
export function imageVersion(image: string): string {
	const withoutDigest = image.split("@")[0] ?? image;
	const tagSeparator = withoutDigest.lastIndexOf(":");
	if (tagSeparator === -1 || tagSeparator < withoutDigest.lastIndexOf("/"))
		return "latest";
	return withoutDigest.slice(tagSeparator + 1);
}
