import { MediaImportStatusEnum } from "@citadel/specs/src/projects/backlog/enum/mediaImportStatus.enum.ts";

import type { MediaImportBean } from "../bean/mediaImportBean.type.ts";
import type { MediaImportRecognizedBean } from "../bean/mediaImportRecognizedBean.type.ts";
import type { MediaImportRejectedBean } from "../bean/mediaImportRejectedBean.type.ts";
import type { FetchedMedia } from "./fetchedMedia.type.ts";

/**
 * Le suivi d'un import de liste en mémoire : sa progression, ce qui est reconnu ou refusé, et les fiches lues sur TMDB,
 * gardées pour « Valider ». `now` est remplaçable par les tests
 */
export function createMediaImportJob(totalCount: number, now = Date.now) {
	let status = MediaImportStatusEnum.READING;
	let readCount = 0;
	let finishedAt: number | null = null;
	let isCancelled = false;
	const recognized: MediaImportRecognizedBean[] = [];
	const rejected: MediaImportRejectedBean[] = [];
	const fetched: FetchedMedia[] = [];

	function finish(finalStatus: MediaImportStatusEnum): void {
		status = finalStatus;
		finishedAt = now();
	}

	return {
		getStatus: () => status,
		isCancelled: () => isCancelled,
		cancel(): void {
			isCancelled = true;
		},
		// `count` lignes traitées, reconnues ou non
		markRead(count = 1): void {
			readCount += count;
		},
		reject(entries: MediaImportRejectedBean[]): void {
			rejected.push(...entries);
		},
		recognize(entries: MediaImportRecognizedBean[]): void {
			recognized.push(...entries);
		},
		keepFetched(media: FetchedMedia): void {
			fetched.push(media);
		},
		getRecognized: () => [...recognized],
		getFetched: () => [...fetched],
		complete: () => finish(MediaImportStatusEnum.READY),
		fail: () => finish(MediaImportStatusEnum.FAILED),
		// Un import fini (prêt ou échoué) depuis plus de `lifetimeMs` n'attend plus « Valider »
		hasExpired: (lifetimeMs: number) =>
			finishedAt !== null && now() - finishedAt > lifetimeMs,
		// Pendant la lecture, seule la progression part : l'interrogation répétée reste légère
		toBean(): MediaImportBean {
			const isReady = status === MediaImportStatusEnum.READY;
			return {
				status,
				readCount,
				totalCount,
				recognized: isReady ? [...recognized] : [],
				rejected: isReady ? [...rejected] : [],
			};
		},
	};
}
