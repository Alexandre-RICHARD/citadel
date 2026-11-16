import type { SagaChoiceBean } from "./sagaChoiceBean.type.ts";

// Personnalisation saisie d'un média : la saga est un choix, résolu par le serveur
export type MediaCustomizationBean = {
	imagePath: string | null;
	saga: SagaChoiceBean;
	sagaNumber: number | null;
};
