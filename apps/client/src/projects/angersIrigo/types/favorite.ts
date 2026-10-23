/* eslint-disable no-restricted-syntax -- projet importé tel quel depuis un répo externe, structure d’origine conservée */
/** Un sens d'une ligne à un arrêt, dont l'encadré des favoris affiche les prochains passages */
export type Favorite = {
	/** id du StopGroup */
	stopId: string;
	routeId: string;
	/** 0 ou 1 */
	directionId: number;
};
