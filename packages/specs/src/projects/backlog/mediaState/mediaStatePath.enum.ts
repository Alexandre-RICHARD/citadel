/**
 * Les fichiers de media-state (/Volume1/appdata/media-state sur le NAS), relatifs à son dossier. Deux sous-dossiers, pour
 * deux écrivains : `survey/`, écrit par le job media-sync et monté en lecture seule dans l'instance locale ;
 * `verified/`, écrit par l'instance locale seule (les cases « Vérifié »). Docker ne sait pas monter en écriture un
 * fichier qu'on remplace par renommage : c'est un dossier entier qui l'est
 */
export enum MediaStatePathEnum {
	CURRENT_SURVEY = "survey/current.json",
	// Le relevé d'avant, pour le rapport de la console ; rien de plus ancien
	PREVIOUS_SURVEY = "survey/previous.json",
	VERIFIED_DIR = "verified",
	VERIFICATIONS = "verified/verified.json",
}
