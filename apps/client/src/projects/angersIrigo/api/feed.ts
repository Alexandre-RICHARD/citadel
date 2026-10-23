/* eslint-disable citadel/max-one-export -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import { type IConversionOptions, parse } from "protobufjs";

import type { FeedMessage } from "../types/gtfs-realtime";
// Schéma officiel GTFS-RT, copié depuis github.com/google/gtfs-realtime-bindings.
// `?raw` : Vite importe le contenu du fichier sous forme de chaîne
import gtfsRealtimeProto from "./gtfs-realtime.proto?raw";

// Le schéma est compilé une seule fois, au chargement du module
const feedMessageSchema = parse(gtfsRealtimeProto).root.lookupType(
	"transit_realtime.FeedMessage",
);

/**
 * Options de conversion du message protobuf en objet JS.
 * Les types de src/types/gtfs-realtime.ts en dépendent : les modifier implique de revoir les types.
 */
const FEED_CONVERSION_OPTIONS: IConversionOptions = {
	enums: String, // nom de la valeur ('FULL_DATASET') plutôt que son numéro
	longs: Number, // int64 en number plutôt qu'en objet Long
};

/** Décode un flux GTFS-RT binaire (protobuf) */
export function decodeFeed(buffer: Uint8Array): FeedMessage {
	const message = feedMessageSchema.decode(buffer);
	// toObject() renvoie un objet non typé ; sa forme est garantie par le schéma et les options de conversion
	return feedMessageSchema.toObject(
		message,
		FEED_CONVERSION_OPTIONS,
	) as FeedMessage;
}

/** Télécharge et décode un flux GTFS-RT */
export async function fetchFeed(
	url: string,
	signal?: AbortSignal,
): Promise<FeedMessage> {
	const response = await fetch(url, { signal: signal ?? null });
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} sur ${url}`);
	}
	const buffer = new Uint8Array(await response.arrayBuffer());
	return decodeFeed(buffer);
}
