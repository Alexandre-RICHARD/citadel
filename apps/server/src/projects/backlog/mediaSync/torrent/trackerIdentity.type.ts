/**
 * Un tracker tel que le job le désigne. `name` : celui de MEDIA_TRACKERS, null pour un tracker qu'elle ne nomme pas ;
 * `label` : ce nom, sinon le seul nom d'hôte. Jamais l'adresse, qui contient la clé personnelle
 */
export type TrackerIdentity = { name: string | null; label: string };
