/* eslint-disable citadel/max-one-export, no-restricted-syntax -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
import { getPrefersReducedMotion } from "@citadel/common/src/browser/dom/getPrefersReducedMotion";
import { easeInOutQuad } from "@citadel/common/src/universal/animation/easeInOutQuad";
import { interpolate } from "@citadel/common/src/universal/number/interpolate";
import { latLng, type Marker } from "leaflet";
import { type RefObject, useEffect } from "react";

import type { Point } from "../types/geo";

/** Au-delà, le marqueur est déplacé d'un coup : changement de course ou position aberrante */
const MAX_ANIMATED_DISTANCE_METERS = 1500;

export type Easing = (progress: number) => number;

/** Vitesse constante : pour enchaîner des déplacements sans à-coups */
export function linear(t: number): number {
	return t;
}

/**
 * Fait glisser le marqueur jusqu'à `position` en `durationMs`, au lieu de l'y téléporter.
 * Leaflet n'anime pas les déplacements : on recalcule la position à chaque image. Une nouvelle
 * position reçue en cours de route repart de l'endroit où se trouve le marqueur.
 */
export function useMarkerAnimation(
	markerRef: RefObject<Marker | null>,
	[latitude, longitude]: Point,
	durationMs: number,
	easing: Easing = easeInOutQuad,
): void {
	useEffect(() => {
		const marker = markerRef.current;
		const from = marker?.getLatLng();
		const to = latLng(latitude, longitude);
		if (!marker || !from || from.equals(to)) {
			return undefined;
		}
		if (
			getPrefersReducedMotion() ||
			from.distanceTo(to) > MAX_ANIMATED_DISTANCE_METERS
		) {
			marker.setLatLng(to);
			return undefined;
		}

		const startTime = performance.now();
		let frameId = requestAnimationFrame(function step(now: number): void {
			// Onglet en arrière-plan : les images sont suspendues, l'animation se termine au retour
			const elapsed = Math.min(1, (now - startTime) / durationMs);
			const progress = easing(elapsed);
			marker.setLatLng([
				interpolate(from.lat, to.lat, progress),
				interpolate(from.lng, to.lng, progress),
			]);
			if (elapsed < 1) {
				frameId = requestAnimationFrame(step);
			}
		});
		return () => cancelAnimationFrame(frameId);
	}, [markerRef, latitude, longitude, durationMs, easing]);
}
