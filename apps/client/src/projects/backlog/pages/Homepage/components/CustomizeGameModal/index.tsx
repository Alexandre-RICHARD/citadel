import { Palette } from "lucide-react";

import { useStoredGame } from "../../../../api/game/useStoredGame";
import { Modal } from "../../../../components/Modal";
import { useIsFreshOnce } from "../../../../hooks/useIsFreshOnce";
import { CustomizeGameForm } from "../CustomizeGameForm";
import { LoadingState } from "../LoadingState";
import { ModalActions } from "../ModalActions";

type Props = {
	gameId: number;
	onClose: () => void;
};

// « Personnaliser » (cahier des charges, §8) : la personnalisation actuelle se lit avec le jeu en base
export function CustomizeGameModal({ gameId, onClose }: Props) {
	const storedGame = useStoredGame(gameId);
	const isFresh = useIsFreshOnce(storedGame);

	if (storedGame.data === undefined || !isFresh)
		return (
			<Modal
				title="Personnaliser"
				icon={Palette}
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
		<CustomizeGameForm
			storedGame={storedGame.data}
			onClose={onClose}
		/>
	);
}
