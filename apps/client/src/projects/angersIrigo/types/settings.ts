/* eslint-disable no-restricted-syntax -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
/** Préférences de l'utilisateur, réglables dans le menu Paramètres */
export type Settings = {
	/** Afficher les véhicules sans signal depuis STALE_POSITION_SECONDS (estompés) */
	showStaleVehicles: boolean;
	/** Afficher les arrêts (à partir de STOPS_MIN_ZOOM), cliquables pour voir les prochains passages */
	showStops: boolean;
	/** Faire avancer les véhicules sur leur tracé entre deux positions reçues (voir utils/simulation.ts) */
	simulateMovement: boolean;
	/**
	 * Intervalle des repères de temps posés sur le tracé du véhicule sélectionné, en minutes
	 * (une valeur de TIME_MARKER_STEPS_MINUTES) ; 0 pour ne pas en afficher
	 */
	timeMarkersMinutes: number;
};
