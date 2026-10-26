import { Plus } from "lucide-react";
import { useState } from "react";

import { useImportGameContent } from "../../../../api/game/useImportGameContent";
import { useStoreGame } from "../../../../api/game/useStoreGame";
import type { GamePreviewFm } from "../../../../api/model/gamePreviewFm.type";
import styles from "../../../../backlog.module.scss";
import { Callout } from "../../../../components/Callout";
import { Checkbox } from "../../../../components/Checkbox";
import { Modal } from "../../../../components/Modal";
import type { BacklogModal } from "../../backlogModal.type";
import { EMPTY_IMPORT_SELECTION } from "../../emptyImportSelection";
import { getNextQueuedModal } from "../../getNextQueuedModal";
import type { ImportSelection } from "../../importSelection.type";
import { GamePreview } from "../GamePreview";
import { ModalActions } from "../ModalActions";

type Props = {
	igdbId: number;
	preview: GamePreviewFm;
	queuedIgdbIds: number[];
	onOpenModal: (modal: BacklogModal | null) => void;
	onClose: () => void;
};

/**
 * « Valider » enregistre le jeu ; avec « Ajouter à mon backlog », l'ajout au backlog s'ouvre ensuite, action distincte
 * (cahier des charges, §8), avec les images déjà lues. Les DLC cochés « comme jeu » suivent, dans l'ordre
 */
export function AddGameForm({
	igdbId,
	preview,
	queuedIgdbIds,
	onOpenModal,
	onClose,
}: Props) {
	const gameId = preview.game.id;
	const [selection, setSelection] = useState<ImportSelection>(
		EMPTY_IMPORT_SELECTION,
	);
	const [isAddingToBacklog, setIsAddingToBacklog] = useState(true);
	const storeGame = useStoreGame(igdbId, gameId);
	const importGameContent = useImportGameContent(gameId);

	function validate() {
		const { versionIds, dlcIds } = selection;
		// Déjà en base (un autre onglet l'a ajouté) : seules les fiches manquantes s'ajoutent
		if (!preview.isStored)
			storeGame.mutate({ igdbId: gameId, versionIds, dlcIds });
		else if (versionIds.length + dlcIds.length > 0)
			importGameContent.mutate({ versionIds, dlcIds });

		const nextQueuedIgdbIds = [
			...preview.dlcs
				.filter(({ id }) => selection.dlcAsGameIds.includes(id))
				.map(({ id }) => id),
			...queuedIgdbIds,
		];
		onOpenModal(
			isAddingToBacklog
				? {
						kind: "addUserVersion",
						gameId,
						// La version originale est pré-sélectionnée si c'est la seule cochée
						versionId: versionIds.length === 0 ? gameId : null,
						imageIds: preview.imageIds,
						queuedIgdbIds: nextQueuedIgdbIds,
					}
				: getNextQueuedModal(nextQueuedIgdbIds),
		);
	}

	return (
		<Modal
			title="Ajouter un jeu"
			subtitle="Ce qui sera enregistré en base, tel que le donne IGDB"
			icon={Plus}
			size="lg"
			footerStart={
				<Checkbox
					checked={isAddingToBacklog}
					label="Ajouter à mon backlog"
					tooltip="Après « Valider », ouvre l’ajout au backlog : personnalisation, version jouée, plateforme et tes données"
					onChange={() => setIsAddingToBacklog(!isAddingToBacklog)}
				/>
			}
			actions={
				<ModalActions
					canValidate
					onCancel={onClose}
					onValidate={validate}
				/>
			}
			onClose={onClose}
		>
			<div className={styles.formStack}>
				{preview.isStored && (
					<Callout>
						Ce jeu est déjà en base : seules les fiches manquantes s’ajouteront.
					</Callout>
				)}
				<GamePreview
					preview={preview}
					selection={selection}
					onSelectionChange={setSelection}
				/>
			</div>
		</Modal>
	);
}
