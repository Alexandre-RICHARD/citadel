import { crc32 } from "node:zlib";

import type { ZipEntry } from "./zipEntry.type.ts";

const LOCAL_HEADER_SIGNATURE = 0x04034b50;
const CENTRAL_HEADER_SIGNATURE = 0x02014b50;
const END_SIGNATURE = 0x06054b50;
const VERSION_NEEDED = 20;
// Bit 11 : les noms sont en UTF-8
const UTF8_FLAG = 0x0800;
const STORED_METHOD = 0;
const LOCAL_HEADER_SIZE = 30;
const CENTRAL_HEADER_SIZE = 46;
const END_SIZE = 22;

// L'heure d'un fichier du ZIP : deux mots de 16 bits, à la seconde paire près, à partir de 1980
function toDosDateTime(date: Date): { time: number; date: number } {
	return {
		time:
			(date.getUTCHours() << 11) |
			(date.getUTCMinutes() << 5) |
			Math.floor(date.getUTCSeconds() / 2),
		date:
			((Math.max(date.getUTCFullYear(), 1980) - 1980) << 9) |
			((date.getUTCMonth() + 1) << 5) |
			date.getUTCDate(),
	};
}

/**
 * Un ZIP sans compression (méthode « stored »), fait à la main : des fichiers de texte de quelques lignes n'ont rien à
 * gagner à être compressés, et zlib.crc32 suffit au reste. Noms en UTF-8, tous à la même date
 */
export function buildStoredZip(
	entries: readonly ZipEntry[],
	date: Date,
): Buffer {
	const dos = toDosDateTime(date);
	const localParts: Buffer[] = [];
	const centralParts: Buffer[] = [];
	let offset = 0;

	for (const { name, content } of entries) {
		const nameBytes = Buffer.from(name, "utf8");
		const data = Buffer.from(content, "utf8");
		const checksum = crc32(data);

		const local = Buffer.alloc(LOCAL_HEADER_SIZE);
		local.writeUInt32LE(LOCAL_HEADER_SIGNATURE, 0);
		local.writeUInt16LE(VERSION_NEEDED, 4);
		local.writeUInt16LE(UTF8_FLAG, 6);
		local.writeUInt16LE(STORED_METHOD, 8);
		local.writeUInt16LE(dos.time, 10);
		local.writeUInt16LE(dos.date, 12);
		local.writeUInt32LE(checksum, 14);
		local.writeUInt32LE(data.length, 18);
		local.writeUInt32LE(data.length, 22);
		local.writeUInt16LE(nameBytes.length, 26);
		localParts.push(local, nameBytes, data);

		const central = Buffer.alloc(CENTRAL_HEADER_SIZE);
		central.writeUInt32LE(CENTRAL_HEADER_SIGNATURE, 0);
		central.writeUInt16LE(VERSION_NEEDED, 4);
		central.writeUInt16LE(VERSION_NEEDED, 6);
		central.writeUInt16LE(UTF8_FLAG, 8);
		central.writeUInt16LE(STORED_METHOD, 10);
		central.writeUInt16LE(dos.time, 12);
		central.writeUInt16LE(dos.date, 14);
		central.writeUInt32LE(checksum, 16);
		central.writeUInt32LE(data.length, 20);
		central.writeUInt32LE(data.length, 24);
		central.writeUInt16LE(nameBytes.length, 28);
		central.writeUInt32LE(offset, 42);
		centralParts.push(central, nameBytes);

		offset += LOCAL_HEADER_SIZE + nameBytes.length + data.length;
	}

	const centralDirectory = Buffer.concat(centralParts);
	const end = Buffer.alloc(END_SIZE);
	end.writeUInt32LE(END_SIGNATURE, 0);
	end.writeUInt16LE(entries.length, 8);
	end.writeUInt16LE(entries.length, 10);
	end.writeUInt32LE(centralDirectory.length, 12);
	end.writeUInt32LE(offset, 16);

	return Buffer.concat([...localParts, centralDirectory, end]);
}
