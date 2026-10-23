/* eslint-disable citadel/max-one-export, no-restricted-syntax, citadel/file-name-case -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
/**
 * Types du flux GTFS-Realtime, tels que renvoyés par `toObject()` de protobufjs.
 *
 * Écrits à la main d'après src/api/gtfs-realtime.proto (toutes les entités, y compris
 * celles qu'Irigo n'utilise pas). La forme découle des options de conversion
 * (voir FEED_CONVERSION_OPTIONS dans src/api/feed.ts) :
 * - noms de champs en camelCase (`route_id` → `routeId`) ;
 * - champ `optional` absent du message → propriété absente (pas de valeur par défaut) ;
 * - champ `required` → toujours présent (le décodage échoue sinon) ;
 * - champ `repeated` absent → propriété absente (pas de tableau vide) ;
 * - enums → nom de la valeur (`'FULL_DATASET'`) ;
 * - int64 / uint64 → number (sans perte pour des timestamps en secondes).
 *
 * Référence : https://gtfs.org/realtime/reference/
 */

/* ------------------------------------------------------------------ */
/* Racine                                                              */
/* ------------------------------------------------------------------ */

/** Contenu complet d'une réponse du flux */
export type FeedMessage = {
	header: FeedHeader;
	entity?: FeedEntity[];
};

export type Incrementality = "FULL_DATASET" | "DIFFERENTIAL";

export type FeedHeader = {
	/** Version de la spécification, ex : "2.0" */
	gtfsRealtimeVersion: string;
	incrementality?: Incrementality;
	/** Date de génération du flux (secondes depuis l'epoch, UTC) */
	timestamp?: number;
	feedVersion?: string;
};

/** Une entrée du flux : contient en pratique un seul des champs optionnels */
export type FeedEntity = {
	/** Identifiant unique dans le flux, stable d'une mise à jour à l'autre */
	id: string;
	isDeleted?: boolean;
	tripUpdate?: TripUpdate;
	vehicle?: VehiclePosition;
	alert?: Alert;
	/** Expérimental */
	shape?: Shape;
	/** Expérimental */
	stop?: Stop;
	/** Expérimental */
	tripModifications?: TripModifications;
};

/* ------------------------------------------------------------------ */
/* Position des véhicules (seule entité fournie par vehicle-positions) */
/* ------------------------------------------------------------------ */

export type VehicleStopStatus = "INCOMING_AT" | "STOPPED_AT" | "IN_TRANSIT_TO";

export type CongestionLevel =
	| "UNKNOWN_CONGESTION_LEVEL"
	| "RUNNING_SMOOTHLY"
	| "STOP_AND_GO"
	| "CONGESTION"
	| "SEVERE_CONGESTION";

export type OccupancyStatus =
	| "EMPTY"
	| "MANY_SEATS_AVAILABLE"
	| "FEW_SEATS_AVAILABLE"
	| "STANDING_ROOM_ONLY"
	| "CRUSHED_STANDING_ROOM_ONLY"
	| "FULL"
	| "NOT_ACCEPTING_PASSENGERS"
	| "NO_DATA_AVAILABLE"
	| "NOT_BOARDABLE";

export type VehiclePosition = {
	trip?: TripDescriptor;
	vehicle?: VehicleDescriptor;
	position?: Position;
	/** Rang de l'arrêt courant dans le trajet (stop_sequence du GTFS) */
	currentStopSequence?: number;
	/** Arrêt courant (stop_id du GTFS) */
	stopId?: string;
	/** Statut par rapport à l'arrêt courant ; IN_TRANSIT_TO si absent */
	currentStatus?: VehicleStopStatus;
	/** Date de la mesure de position (secondes depuis l'epoch, UTC) */
	timestamp?: number;
	congestionLevel?: CongestionLevel;
	occupancyStatus?: OccupancyStatus;
	/** Taux d'occupation en %, peut dépasser 100 */
	occupancyPercentage?: number;
	/** Détail par voiture (rames de tram, trains) */
	multiCarriageDetails?: CarriageDetails[];
};

export type CarriageDetails = {
	id?: string;
	label?: string;
	occupancyStatus?: OccupancyStatus;
	/** -1 si inconnu */
	occupancyPercentage?: number;
	/** Rang de la voiture dans la rame, à partir de 1 */
	carriageSequence?: number;
};

export type Position = {
	/** Degrés, WGS-84 */
	latitude: number;
	/** Degrés, WGS-84 */
	longitude: number;
	/** Cap en degrés, 0 = nord, sens horaire */
	bearing?: number;
	/** Distance parcourue, en mètres */
	odometer?: number;
	/** Vitesse en m/s */
	speed?: number;
};

/* ------------------------------------------------------------------ */
/* Descripteurs partagés                                               */
/* ------------------------------------------------------------------ */

export type TripScheduleRelationship =
	| "SCHEDULED"
	| "ADDED" // Déprécié
	| "UNSCHEDULED"
	| "CANCELED"
	| "REPLACEMENT"
	| "DUPLICATED"
	| "DELETED"
	| "NEW";

/** Identifie un trajet (trip) du GTFS théorique */
export type TripDescriptor = {
	tripId?: string;
	/** Ligne (route_id du GTFS), ex : "01", "A" */
	routeId?: string;
	/** Sens : 0 ou 1 */
	directionId?: number;
	/** Heure de départ prévue, "HH:MM:SS" (peut dépasser 24:00:00) */
	startTime?: string;
	/** Date de service, "YYYYMMDD" */
	startDate?: string;
	scheduleRelationship?: TripScheduleRelationship;
	modifiedTrip?: ModifiedTripSelector;
};

export type ModifiedTripSelector = {
	modificationsId?: string;
	affectedTripId?: string;
	startTime?: string;
	startDate?: string;
};

export type WheelchairAccessible =
	"NO_VALUE" | "UNKNOWN" | "WHEELCHAIR_ACCESSIBLE" | "WHEELCHAIR_INACCESSIBLE";

/** Identifie le véhicule physique */
export type VehicleDescriptor = {
	/** Identifiant interne, stable */
	id?: string;
	/** Libellé visible par les voyageurs */
	label?: string;
	licensePlate?: string;
	wheelchairAccessible?: WheelchairAccessible;
};

/** Sélectionne ce qu'une alerte concerne ; au moins un champ est renseigné */
export type EntitySelector = {
	agencyId?: string;
	routeId?: string;
	/** route_type du GTFS : 0 = tram, 3 = bus… */
	routeType?: number;
	trip?: TripDescriptor;
	stopId?: string;
	directionId?: number;
};

/** Texte disponible en plusieurs langues */
export type TranslatedString = {
	translation?: Translation[];
};

export type Translation = {
	text: string;
	/** Code BCP-47, ex : "fr" */
	language?: string;
};

/** Image disponible en plusieurs langues */
export type TranslatedImage = {
	localizedImage?: LocalizedImage[];
};

export type LocalizedImage = {
	url: string;
	/** Type MIME, ex : "image/png" */
	mediaType: string;
	language?: string;
};

/** Intervalle de temps ; une borne absente signifie « sans limite » */
export type TimeRange = {
	/** Secondes depuis l'epoch, UTC */
	start?: number;
	/** Secondes depuis l'epoch, UTC */
	end?: number;
};

/* ------------------------------------------------------------------ */
/* Mises à jour de trajet (flux trip-updates)                          */
/* ------------------------------------------------------------------ */

export type TripUpdate = {
	trip: TripDescriptor;
	vehicle?: VehicleDescriptor;
	stopTimeUpdate?: StopTimeUpdate[];
	/** Date de la dernière mesure (secondes depuis l'epoch, UTC) */
	timestamp?: number;
	/** Retard courant en secondes (négatif = en avance) */
	delay?: number;
	tripProperties?: TripProperties;
};

export type StopTimeEvent = {
	/** Retard en secondes (négatif = en avance) */
	delay?: number;
	/** Heure absolue (secondes depuis l'epoch, UTC) */
	time?: number;
	/** Incertitude en secondes ; 0 = certain */
	uncertainty?: number;
	/** Heure théorique (secondes depuis l'epoch, UTC) */
	scheduledTime?: number;
};

export type StopTimeScheduleRelationship =
	"SCHEDULED" | "SKIPPED" | "NO_DATA" | "UNSCHEDULED";

export type StopTimeUpdate = {
	stopSequence?: number;
	stopId?: string;
	arrival?: StopTimeEvent;
	departure?: StopTimeEvent;
	departureOccupancyStatus?: OccupancyStatus;
	scheduleRelationship?: StopTimeScheduleRelationship;
	stopTimeProperties?: StopTimeProperties;
};

export type DropOffPickupType =
	"REGULAR" | "NONE" | "PHONE_AGENCY" | "COORDINATE_WITH_DRIVER";

export type StopTimeProperties = {
	/** Arrêt de remplacement (changement de quai…) */
	assignedStopId?: string;
	stopHeadsign?: string;
	pickupType?: DropOffPickupType;
	dropOffType?: DropOffPickupType;
};

/** Propriétés d'un trajet ajouté ou modifié */
export type TripProperties = {
	tripId?: string;
	startDate?: string;
	startTime?: string;
	shapeId?: string;
	tripHeadsign?: string;
	tripShortName?: string;
};

/* ------------------------------------------------------------------ */
/* Alertes (flux alerts)                                               */
/* ------------------------------------------------------------------ */

export type AlertCause =
	| "UNKNOWN_CAUSE"
	| "OTHER_CAUSE"
	| "TECHNICAL_PROBLEM"
	| "STRIKE"
	| "DEMONSTRATION"
	| "ACCIDENT"
	| "HOLIDAY"
	| "WEATHER"
	| "MAINTENANCE"
	| "CONSTRUCTION"
	| "POLICE_ACTIVITY"
	| "MEDICAL_EMERGENCY"
	| "SPECIAL_EVENT";

export type AlertEffect =
	| "NO_SERVICE"
	| "REDUCED_SERVICE"
	| "SIGNIFICANT_DELAYS"
	| "DETOUR"
	| "ADDITIONAL_SERVICE"
	| "MODIFIED_SERVICE"
	| "OTHER_EFFECT"
	| "UNKNOWN_EFFECT"
	| "STOP_MOVED"
	| "NO_EFFECT"
	| "ACCESSIBILITY_ISSUE";

export type SeverityLevel = "UNKNOWN_SEVERITY" | "INFO" | "WARNING" | "SEVERE";

export type Alert = {
	/** @deprecated Remplacé par communicationPeriod et impactPeriod */
	activePeriod?: TimeRange[];
	/** Période pendant laquelle l'alerte doit être affichée */
	communicationPeriod?: TimeRange[];
	/** Période pendant laquelle le service est perturbé */
	impactPeriod?: TimeRange[];
	informedEntity?: EntitySelector[];
	cause?: AlertCause;
	effect?: AlertEffect;
	url?: TranslatedString;
	headerText?: TranslatedString;
	descriptionText?: TranslatedString;
	/** Versions adaptées à la synthèse vocale */
	ttsHeaderText?: TranslatedString;
	ttsDescriptionText?: TranslatedString;
	severityLevel?: SeverityLevel;
	image?: TranslatedImage;
	imageAlternativeText?: TranslatedString;
	causeDetail?: TranslatedString;
	effectDetail?: TranslatedString;
};

/* ------------------------------------------------------------------ */
/* Entités expérimentales (modifications de trajet)                    */
/* ------------------------------------------------------------------ */

/** Tracé d'un trajet dévié */
export type Shape = {
	shapeId?: string;
	/** Polyligne encodée (format Google) */
	encodedPolyline?: string;
};

export type WheelchairBoarding = "UNKNOWN" | "AVAILABLE" | "NOT_AVAILABLE";

/** Arrêt temporaire, absent du GTFS théorique */
export type Stop = {
	stopId?: string;
	stopCode?: TranslatedString;
	stopName?: TranslatedString;
	ttsStopName?: TranslatedString;
	stopDesc?: TranslatedString;
	stopLat?: number;
	stopLon?: number;
	zoneId?: string;
	stopUrl?: TranslatedString;
	parentStation?: string;
	stopTimezone?: string;
	wheelchairBoarding?: WheelchairBoarding;
	levelId?: string;
	platformCode?: TranslatedString;
};

export type TripModifications = {
	selectedTrips?: SelectedTrips[];
	/** Heures de départ "HH:MM:SS" concernées (trajets en fréquence) */
	startTimes?: string[];
	/** Dates de service "YYYYMMDD" concernées */
	serviceDates?: string[];
	modifications?: Modification[];
};

export type SelectedTrips = {
	tripIds?: string[];
	/** Tracé à utiliser à la place de celui du GTFS */
	shapeId?: string;
};

export type Modification = {
	startStopSelector?: StopSelector;
	endStopSelector?: StopSelector;
	/** Retard ajouté aux arrêts après la modification, en secondes */
	propagatedModificationDelay?: number;
	replacementStops?: ReplacementStop[];
	serviceAlertId?: string;
	/** Secondes depuis l'epoch, UTC */
	lastModifiedTime?: number;
};

export type StopSelector = {
	stopSequence?: number;
	stopId?: string;
};

export type ReplacementStop = {
	/** Temps de trajet depuis le début de la modification, en secondes */
	travelTimeToStop?: number;
	stopId?: string;
};
