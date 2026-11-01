/* eslint-disable citadel/max-one-export, no-restricted-syntax -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
// Le décodeur officiel GTFS-RT, précompilé : il n'a pas besoin de `eval`, que la
// Content-Security-Policy du site interdit (infra/Caddyfile). protobufjs, lui, fabrique son décodeur
// à l'exécution à partir d'un fichier .proto, avec `new Function` : il aurait fallu autoriser
// 'unsafe-eval' pour tout le site.
import { transit_realtime } from "gtfs-realtime-bindings";

import type { FeedMessage } from "../types/gtfs-realtime";

/**
 * Options de conversion du message protobuf en objet JS.
 * Les types de src/types/gtfs-realtime.ts en dépendent : les modifier implique de revoir les types.
 */
const FEED_CONVERSION_OPTIONS: Parameters<
	typeof transit_realtime.FeedMessage.toObject
>[1] = {
	enums: String, // nom de la valeur ('FULL_DATASET') plutôt que son numéro
	longs: Number, // int64 en number plutôt qu'en objet Long
};

/** Décode un flux GTFS-RT binaire (protobuf) */
export function decodeFeed(buffer: Uint8Array): FeedMessage {
	const message = transit_realtime.FeedMessage.decode(buffer);
	// toObject() renvoie un objet non typé ; sa forme est garantie par le schéma officiel et les options de conversion
	return transit_realtime.FeedMessage.toObject(
		message,
		FEED_CONVERSION_OPTIONS,
	) as FeedMessage;
}

export type FetchedFeed = {
	feed: FeedMessage;
	/**
	 * Heure du serveur à la réponse (ms depuis l'epoch), d'après l'en-tête Date : l'horloge du
	 * navigateur peut être décalée de plusieurs secondes. Celle du navigateur s'il manque.
	 */
	serverTime: number;
};

/** Télécharge et décode un flux GTFS-RT */
export async function fetchFeed(
	url: string,
	signal?: AbortSignal,
): Promise<FetchedFeed> {
	const response = await fetch(url, { signal: signal ?? null });
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} sur ${url}`);
	}
	const buffer = new Uint8Array(await response.arrayBuffer());
	const dateHeader = Date.parse(response.headers.get("Date") ?? "");
	return {
		feed: decodeFeed(buffer),
		serverTime: Number.isNaN(dateHeader) ? Date.now() : dateHeader,
	};
}
