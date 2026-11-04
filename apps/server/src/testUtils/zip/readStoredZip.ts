import type { ReadZipEntry } from "./readZipEntry.type.ts";

// Relit un ZIP sans compression comme un décompresseur : par le répertoire central, à la fin du fichier
export function readStoredZip(zip: Buffer): ReadZipEntry[] {
	const endOffset = zip.length - 22;
	if (zip.readUInt32LE(endOffset) !== 0x06054b50)
		throw new Error("Not a ZIP archive");
	const count = zip.readUInt16LE(endOffset + 10);
	let cursor = zip.readUInt32LE(endOffset + 16);
	const entries: ReadZipEntry[] = [];

	for (let index = 0; index < count; index++) {
		if (zip.readUInt32LE(cursor) !== 0x02014b50)
			throw new Error("Broken central directory");
		const checksum = zip.readUInt32LE(cursor + 16);
		const size = zip.readUInt32LE(cursor + 20);
		const nameLength = zip.readUInt16LE(cursor + 28);
		const localOffset = zip.readUInt32LE(cursor + 42);
		const name = zip.toString("utf8", cursor + 46, cursor + 46 + nameLength);

		if (zip.readUInt32LE(localOffset) !== 0x04034b50)
			throw new Error("Broken local header");
		const dataStart = localOffset + 30 + zip.readUInt16LE(localOffset + 26);
		entries.push({
			name,
			content: zip.toString("utf8", dataStart, dataStart + size),
			checksum,
		});
		cursor += 46 + nameLength;
	}
	return entries;
}
