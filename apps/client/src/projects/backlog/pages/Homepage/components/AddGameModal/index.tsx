import { Plus } from "lucide-react";

import { useGamePreview } from "../../../../api/igdb/useGamePreview";
import { Modal } from "../../../../components/Modal";
import type { BacklogModal } from "../../backlogModal.type";
import { AddGameForm } from "../AddGameForm";
import { LoadingState } from "../LoadingState";
import { ModalActions } from "../ModalActions";

type Props = {
	igdbId: number;
	queuedIgdbIds: number[];
	onOpenModal: (modal: BacklogModal | null) => void;
	onClose: () => void;
};

// Ajout d'un jeu trouvé sur IGDB : sa fiche se lit à l'ouverture
export function AddGameModal({
	igdbId,
	queuedIgdbIds,
	onOpenModal,
	onClose,
}: Props) {
	const preview = useGamePreview(igdbId);

	if (preview.data === undefined)
		return (
			<Modal
				title="Ajouter un jeu"
				subtitle="Ce qui sera enregistré en base, tel que le donne IGDB"
				icon={Plus}
				size="lg"
				actions={
					<ModalActions
						canValidate={false}
						onCancel={onClose}
						onValidate={onClose}
					/>
				}
				onClose={onClose}
			>
				<LoadingState
					error={preview.error}
					actionLabel="charger le jeu depuis IGDB"
				>
					Chargement des données IGDB…
				</LoadingState>
			</Modal>
		);
	return (
		<AddGameForm
			igdbId={igdbId}
			preview={preview.data}
			queuedIgdbIds={queuedIgdbIds}
			onOpenModal={onOpenModal}
			onClose={onClose}
		/>
	);
}
