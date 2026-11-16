import type { DiskFile } from "../disk/diskFile.type.ts";

export function largestFile(files: readonly DiskFile[]): DiskFile | null {
	return files.reduce<DiskFile | null>(
		(largest, file) =>
			largest === null || file.sizeBytes > largest.sizeBytes ? file : largest,
		null,
	);
}
