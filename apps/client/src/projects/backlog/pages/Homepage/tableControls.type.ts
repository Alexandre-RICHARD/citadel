import type { BacklogModal } from "./backlogModal.type";
import type { TablePopover } from "./tablePopover.type";

// Ce que les lignes du tableau lisent de la page et peuvent lui demander ; les écritures passent par les hooks de l'api
export type TableControls = {
	isEditMode: boolean;
	popover: TablePopover | null;
	setPopover: (popover: TablePopover | null) => void;
	openModal: (modal: BacklogModal) => void;
	toggleExpanded: (gameId: number) => void;
	// Un clic sur un nom de série filtre le tableau sur ses jeux
	filterOnSeries: (seriesName: string) => void;
};
