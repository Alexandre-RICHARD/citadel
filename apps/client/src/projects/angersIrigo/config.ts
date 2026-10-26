/* eslint-disable citadel/max-one-export -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import type { LatLngTuple } from "leaflet";

/*
 * Chemins relatifs : les requêtes passent par le proxy de Vite (voir vite.config.ts),
 * car l'API d'origine n'autorise pas les appels depuis un navigateur (pas de CORS).
 */

/** Flux GTFS-RT des positions des véhicules Irigo */
export const VEHICLE_POSITIONS_URL = "/irigo/gtfs/vehicle-positions";

/** Flux GTFS-RT des mises à jour de trajet : heures de passage prévues pour l'heure à venir */
export const TRIP_UPDATES_URL = "/irigo/gtfs/trip-updates";

/**
 * Irigo régénère chaque flux une fois par minute. Chaque flux est redemandé juste après sa
 * prochaine génération, déduite de son heure (header.timestamp), avec une marge.
 */
export const FEED_UPDATE_PERIOD_MS = 60_000;
export const FEED_UPDATE_MARGIN_MS = 2000;

/** Génération en retard (flux pas plus récent que le précédent) : nouvel essai à ce rythme */
export const STALE_FEED_RETRY_MS = 4000;

/** Erreur réseau, ou flux sans heure de génération pour se caler */
export const FEED_FALLBACK_REFRESH_MS = 15_000;

/**
 * Au-delà, un véhicule est considéré comme immobile : masqué par défaut, estompé si le paramètre
 * « Véhicules immobiles » est activé. Le flux garde des véhicules qui n'émettent plus, souvent
 * depuis des heures (sans doute rentrés au dépôt).
 */
export const STALE_POSITION_SECONDS = 10 * 60;

/** Intervalle entre deux positions estimées par la simulation (paramètre « Simulation ») */
export const SIMULATION_TICK_MS = 1000;

/** En dessous de ce zoom, les arrêts sont masqués : ils noieraient la carte */
export const STOPS_MIN_ZOOM = 15;

/** Zoom minimal quand la carte se centre sur un arrêt choisi hors de la carte (favori, recherche) */
export const FOCUSED_STOP_ZOOM = 16;

/** Zoom minimal quand on suit un véhicule */
export const FOLLOWED_VEHICLE_ZOOM = 16;

/** Au-delà, l'encadré des favoris occuperait trop de place sur la carte */
export const MAX_FAVORITES = 5;

/** Même valeur que $breakpoint-mobile (styles/_variables.scss) */
export const MOBILE_MEDIA_QUERY = "(max-width: 600px)";

/** Centre d'Angers */
export const MAP_CENTER: LatLngTuple = [47.47, -0.55];
export const MAP_ZOOM = 13;
