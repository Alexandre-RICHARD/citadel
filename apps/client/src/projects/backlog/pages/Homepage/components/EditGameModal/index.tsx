import { SquarePen } from "lucide-react";
import { useState } from "react";

import { useImportGameContent } from "../../../../api/game/useImportGameContent";
import { useGamePreview } from "../../../../api/igdb/useGamePreview";
import styles from "../../../../backlog.module.scss";
import { Modal } from "../../../../components/Modal";
import type { BacklogModal } from "../../backlogModal.type";
import { EMPTY_IMPORT_SELECTION } from "../../emptyImportSelection";
import { getNextQueuedModal } from "../../getNextQueuedModal";
import type { ImportSelection } from "../../importSelection.type";
import { GamePreview } from "../GamePreview";
import { LoadingState } from "../LoadingState";
import { ModalActions } from "../ModalActions";

type Props = {
	gameId: number;
	onOpenModal: (modal: BacklogModal | null) => void;
	onClose: () => void;
};

/**
 * « Modifier le jeu » : la même modale, données de la base en lecture seule, complétées à
 * l'ouverture des versions et DLC IGDB qui n'y sont pas, à cocher pour les ajouter
 */
export function EditGameModal({ gameId, onOpenModal, onClose }: Props) {
	const preview = useGamePreview(gameId);
	const [selection, setSelection] = useState<ImportSelection>(
		EMPTY_IMPORT_SELECTION,
	);
	const importGameContent = useImportGameContent(gameId);
	const { versionIds, dlcIds, dlcAsGameIds } = selection;
	const hasImports = versionIds.length + dlcIds.length > 0;

	return (
		<Modal
			title="Modifier le jeu"
			subtitle="Ajouter les versions et DLC IGDB qui manquent en base"
			icon={SquarePen}
			size="lg"
			actions={
				// Sans rien de coché en plus, « Valider » reste inactif ; un DLC coché « comme jeu » compte comme un changement
				<ModalActions
					canValidate={hasImports || dlcAsGameIds.length > 0}
					onCancel={onClose}
					onValidate={() => {
						if (hasImports) importGameContent.mutate({ versionIds, dlcIds });
						onOpenModal(
							getNextQueuedModal(
								(preview.data?.dlcs ?? [])
									.filter(({ id }) => dlcAsGameIds.includes(id))
									.map(({ id }) => id),
							),
						);
					}}
				/>
			}
			onClose={onClose}
		>
			{preview.data === undefined ? (
				<LoadingState
					error={preview.error}
					actionLabel="charger le jeu depuis IGDB"
				>
					Chargement des versions et DLC IGDB…
				</LoadingState>
			) : (
				<div className={styles.formStack}>
					<GamePreview
						preview={preview.data}
						selection={selection}
						onSelectionChange={setSelection}
					/>
				</div>
			)}
		</Modal>
	);
}
