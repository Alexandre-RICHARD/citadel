import { createContext } from "react";

/**
 * Prévient la page qu'une fenêtre est réduite en bandeau (ou rouverte) : le tableau, de nouveau accessible dessous, y
 * reste en lecture seule. Sans fournisseur, la page n'est pas prévenue
 */
export const ModalMinimizeContext = createContext<
	(isMinimized: boolean) => void
>(() => undefined);
