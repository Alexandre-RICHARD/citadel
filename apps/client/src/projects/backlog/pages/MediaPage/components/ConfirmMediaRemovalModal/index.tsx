import { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { Trash2 } from "lucide-react";

import { useDeleteUserMedia } from "../../../../api/media/useDeleteUserMedia";
import type { MediaRowFm } from "../../../../api/model/media/mediaRowFm.type";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Modal } from "../../../../components/Modal";

type Props = {
	row: MediaRowFm;
	onClose: () => void;
};

// « Retirer du backlog » : sans annulation possible, il se confirme en disant ce qu'il emporte
export function ConfirmMediaRemovalModal({ row, onClose }: Props) {
	const deleteUserMedia = useDeleteUserMedia(row.userMediaId);
	const watched =
		row.mediaType === MediaTypeEnum.SHOW
			? "ses épisodes vus"
			: "son visionnage";

	return (
		<Modal
			title="Retirer du backlog"
			subtitle={row.title}
			icon={Trash2}
			size="sm"
			actions={
				<>
					<Button onClick={onClose}>Annuler</Button>
					<Button
						variant="danger"
						icon={Trash2}
						onClick={() => {
							deleteUserMedia.mutate();
							onClose();
						}}
					>
						Retirer
					</Button>
				</>
			}
			onClose={onClose}
		>
			<p className={styles.modalQuestion}>
				« {row.title} » quitte le backlog avec {watched} et sa personnalisation
				(miniature, saga, commentaire). Une saga qui n’a plus aucun média
				disparaît.
			</p>
		</Modal>
	);
}
