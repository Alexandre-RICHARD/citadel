// Version du format des fichiers de media-state. Un changement qui casse la lecture (champ renommé, sens changé) la fait
// monter : l'instance locale refuse alors un relevé d'une autre version plutôt que d'en mal lire les colonnes, et le job
// réécrit tout à son passage suivant
export const MEDIA_STATE_FORMAT_VERSION = 1;
