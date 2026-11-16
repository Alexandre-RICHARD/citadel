import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { Plus } from "lucide-react";

import { useMediaPreview } from "../../../../api/media/useMediaPreview";
import { Modal } from "../../../../components/Modal";
import { LoadingState } from "../../../Homepage/components/LoadingState";
import { ModalActions } from "../../../Homepage/components/ModalActions";
import { AddMediaForm } from "../AddMediaForm";

type Props = {
	mediaType: MediaTypeEnum;
	tmdbId: number;
	onClose: () => void;
};

// Ajout d'un film ou d'une série trouvé sur TMDB : sa fiche se lit à l'ouverture
export function AddMediaModal({ mediaType, tmdbId, onClose }: Props) {
	const preview = useMediaPreview(mediaType, tmdbId);

	if (preview.data === undefined)
		return (
			<Modal
				title="Ajouter au backlog"
				subtitle="La fiche telle que la donne TMDB"
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
					actionLabel="charger la fiche depuis TMDB"
				>
					Chargement de la fiche TMDB…
				</LoadingState>
			</Modal>
		);
	return (
		<AddMediaForm
			preview={preview.data}
			onClose={onClose}
		/>
	);
}
