import { describe, expect, it } from "vitest";

import { demuxDockerLogs } from "./demuxDockerLogs.ts";

function frame(streamType: number, text: string): Buffer {
	const payload = Buffer.from(text, "utf8");
	const header = Buffer.alloc(8);
	header[0] = streamType;
	header.writeUInt32BE(payload.length, 4);
	return Buffer.concat([header, payload]);
}

describe("demuxDockerLogs.ts", () => {
	describe("multiplexed stream", () => {
		it("SHOULD join stdout and stderr in order WHEN the container has no tty", () => {
			const raw = Buffer.concat([
				frame(1, "démarrage\n"),
				frame(2, "attention\n"),
				frame(1, "prêt\n"),
			]);
			expect(demuxDockerLogs(raw, false)).toBe("démarrage\nattention\nprêt\n");
		});
	});

	describe("raw stream", () => {
		it("SHOULD return the text as is WHEN the container has a tty", () => {
			expect(demuxDockerLogs(Buffer.from("ligne\n"), true)).toBe("ligne\n");
		});

		it("SHOULD return the text as is WHEN it is not made of frames", () => {
			expect(demuxDockerLogs(Buffer.from("texte simple\n"), false)).toBe(
				"texte simple\n",
			);
		});
	});
});
