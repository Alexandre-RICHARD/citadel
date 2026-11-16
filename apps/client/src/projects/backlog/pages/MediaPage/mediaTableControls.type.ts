import type { MediaModal } from "./mediaModal.type";
import type { MediaTablePopover } from "./mediaTablePopover.type";

// Ce que les lignes du tableau lisent de la page et peuvent lui demander ; les écritures passent par les hooks de l'api
export type MediaTableControls = {
	isEditMode: boolean;
	popover: MediaTablePopover | null;
	setPopover: (popover: MediaTablePopover | null) => void;
	openModal: (modal: MediaModal) => void;
	// Une seule série et une seule saison dépliées à la fois : en déplier une autre replie la précédente
	toggleExpandedShow: (userMediaId: number) => void;
	toggleExpandedSeason: (seasonId: number) => void;
	// Un clic sur un nom de saga filtre le tableau sur ses médias
	filterOnSaga: (sagaName: string) => void;
};
