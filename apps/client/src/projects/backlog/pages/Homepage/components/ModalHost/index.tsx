import type { BacklogColumnEnum } from "@citadel/specs/src/projects/backlog/enum/backlogColumn.enum";

import type { ColumnSetting } from "../../../../helper/view/columnSetting.type";
import type { BacklogModal } from "../../backlogModal.type";
import { getHitModal } from "../../getHitModal";
import { AddDlcsModal } from "../AddDlcsModal";
import { AddFromDatabaseModal } from "../AddFromDatabaseModal";
import { AddGameModal } from "../AddGameModal";
import { AddUserVersionModal } from "../AddUserVersionModal";
import { ColumnsModal } from "../ColumnsModal";
import { ConfirmRemovalModal } from "../ConfirmRemovalModal";
import { CustomizeGameModal } from "../CustomizeGameModal";
import { EditGameModal } from "../EditGameModal";
import { ReorderSeriesModal } from "../ReorderSeriesModal";
import { SetFinishDateModal } from "../SetFinishDateModal";

type Props = {
	modal: BacklogModal;
	columns: ColumnSetting[];
	onOpenModal: (modal: BacklogModal | null) => void;
	// Ferme la modale, ou passe au DLC suivant de la file
	onClose: () => void;
	onToggleColumn: (key: BacklogColumnEnum) => void;
	onMoveColumn: (key: BacklogColumnEnum, offset: -1 | 1) => void;
};

// La modale ouverte ; chacune de l'enchaînement a sa propre fenêtre (key) : défilement, focus et saisie repartent de zéro
export function ModalHost({
	modal,
	columns,
	onOpenModal,
	onClose,
	onToggleColumn,
	onMoveColumn,
}: Props) {
	switch (modal.kind) {
		case "addGame":
			return (
				<AddGameModal
					key={modal.igdbId}
					igdbId={modal.igdbId}
					queuedIgdbIds={modal.queuedIgdbIds}
					onOpenModal={onOpenModal}
					onClose={onClose}
				/>
			);
		case "addFromDatabase":
			return (
				<AddFromDatabaseModal
					onSelect={(hit) => onOpenModal(getHitModal(hit))}
					onClose={onClose}
				/>
			);
		case "addUserVersion":
			return (
				<AddUserVersionModal
					key={modal.gameId}
					gameId={modal.gameId}
					versionId={modal.versionId}
					imageIds={modal.imageIds}
					onClose={onClose}
				/>
			);
		case "editGame":
			return (
				<EditGameModal
					gameId={modal.gameId}
					onOpenModal={onOpenModal}
					onClose={onClose}
				/>
			);
		case "addDlcs":
			return (
				<AddDlcsModal
					gameId={modal.gameId}
					gameName={modal.gameName}
					onClose={onClose}
				/>
			);
		case "customizeGame":
			return (
				<CustomizeGameModal
					gameId={modal.gameId}
					onClose={onClose}
				/>
			);
		case "reorderSeries":
			return (
				<ReorderSeriesModal
					seriesId={modal.seriesId}
					gameId={modal.gameId}
					onClose={onClose}
				/>
			);
		case "setFinishDate":
			return (
				<SetFinishDateModal
					gameId={modal.gameId}
					userVersionId={modal.userVersionId}
					gameName={modal.gameName}
					platformName={modal.platformName}
					onClose={onClose}
				/>
			);
		case "confirmRemoval":
			return (
				<ConfirmRemovalModal
					gameId={modal.gameId}
					userVersionId={modal.userVersionId}
					gameName={modal.gameName}
					platformName={modal.platformName}
					userVersionCount={modal.userVersionCount}
					onClose={onClose}
				/>
			);
		case "editColumns":
			return (
				<ColumnsModal
					columns={columns}
					onToggleVisibility={onToggleColumn}
					onMove={onMoveColumn}
					onClose={onClose}
				/>
			);
		default:
			return null;
	}
}
