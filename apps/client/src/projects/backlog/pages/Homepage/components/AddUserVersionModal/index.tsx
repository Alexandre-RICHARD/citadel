import { LibraryBig } from "lucide-react";

import { useStoredGame } from "../../../../api/game/useStoredGame";
import { Modal } from "../../../../components/Modal";
import { useIsFreshOnce } from "../../../../hooks/useIsFreshOnce";
import { AddUserVersionForm } from "../AddUserVersionForm";
import { LoadingState } from "../LoadingState";
import { ModalActions } from "../ModalActions";

type Props = {
	gameId: number;
	versionId: number | null;
	imageIds: string[] | null;
	onClose: () => void;
};

// Ajout au backlog, ou d'une version jouée : le jeu en base d'abord, déjà en cache s'il vient d'être ajouté
export function AddUserVersionModal({
	gameId,
	versionId,
	imageIds,
	onClose,
}: Props) {
	const storedGame = useStoredGame(gameId);
	const isFresh = useIsFreshOnce(storedGame);

	if (storedGame.data === undefined || !isFresh)
		return (
			<Modal
				title="Ajouter au backlog"
				icon={LibraryBig}
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
					error={storedGame.error}
					actionLabel="charger le jeu"
				>
					Chargement du jeu…
				</LoadingState>
			</Modal>
		);
	return (
		<AddUserVersionForm
			storedGame={storedGame.data}
			versionId={versionId}
			imageIds={imageIds}
			onClose={onClose}
		/>
	);
}
