// Sans terminal (tty), Docker mélange la sortie standard et la sortie d'erreur dans un
// seul flux, découpé en trames : 8 octets d'en-tête (1 : stdout, 2 : stderr ; puis 3 zéros ;
// puis la taille, sur 4 octets), suivis du texte. On garde le texte, dans l'ordre.
const HEADER_SIZE = 8;
const STREAM_TYPES = new Set([0, 1, 2]);

export function demuxDockerLogs(raw: Buffer, hasTty: boolean): string {
	if (hasTty) return raw.toString("utf8");

	const chunks: Buffer[] = [];
	let offset = 0;
	while (offset + HEADER_SIZE <= raw.length) {
		// Pas une trame : flux brut, rendu tel quel
		if (!STREAM_TYPES.has(raw[offset])) return raw.toString("utf8");
		const size = raw.readUInt32BE(offset + 4);
		chunks.push(
			raw.subarray(offset + HEADER_SIZE, offset + HEADER_SIZE + size),
		);
		offset += HEADER_SIZE + size;
	}
	return Buffer.concat(chunks).toString("utf8");
}
