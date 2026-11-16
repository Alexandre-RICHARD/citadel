import { SagaChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/sagaChoiceKind.enum";
import { mediaCustomizationSchema } from "@citadel/specs/src/projects/backlog/schema/mediaCustomizationSchema";
import { Palette } from "lucide-react";
import { useState } from "react";

import { checkInput } from "../../../../../../common/validation/checkInput";
import { backlogFieldLabels } from "../../../../api/backlogFieldLabels";
import { useAllSagas } from "../../../../api/media/useAllSagas";
import { useCustomizeUserMedia } from "../../../../api/media/useCustomizeUserMedia";
import type { MediaRowFm } from "../../../../api/model/media/mediaRowFm.type";
import { Callout } from "../../../../components/Callout";
import { Modal } from "../../../../components/Modal";
import { getChosenSagaId } from "../../../../helper/media/getChosenSagaId";
import type { MediaCustomizationDraft } from "../../../../helper/media/mediaCustomizationDraft.type";
import { ModalActions } from "../../../Homepage/components/ModalActions";
import { MediaCustomizationFields } from "../MediaCustomizationFields";

type Props = {
	row: MediaRowFm;
	onClose: () => void;
};

/**
 * « Personnaliser » : miniature, saga et numéro d'un film ou d'une série du backlog, partis de ceux de sa ligne. « Valider »
 * reste inactif sans changement ; sans saga, le numéro ne compte pas
 */
export function CustomizeMediaModal({ row, onClose }: Props) {
	const [draft, setDraft] = useState<MediaCustomizationDraft>({
		imagePath: row.imagePath,
		saga:
			row.saga === null
				? { kind: SagaChoiceKindEnum.NONE }
				: { kind: SagaChoiceKindEnum.OTHER, sagaId: row.saga.id },
		sagaNumber: row.sagaNumber,
	});
	const sagas = useAllSagas();
	const customizeUserMedia = useCustomizeUserMedia(row.userMediaId);
	const check = checkInput(mediaCustomizationSchema, draft, backlogFieldLabels);
	// Une nouvelle saga (undefined) est toujours un changement
	const chosenSagaId = getChosenSagaId(draft.saga, null, sagas);
	const hasChanges =
		draft.imagePath !== row.imagePath ||
		chosenSagaId !== (row.saga?.id ?? null) ||
		(chosenSagaId === null ? null : draft.sagaNumber) !== row.sagaNumber;

	return (
		<Modal
			title="Personnaliser"
			subtitle={row.title}
			icon={Palette}
			actions={
				<ModalActions
					canValidate={check.isValid && hasChanges}
					onCancel={onClose}
					onValidate={() => {
						if (check.isValid) customizeUserMedia.mutate(check.data);
						onClose();
					}}
				/>
			}
			onClose={onClose}
		>
			<MediaCustomizationFields
				mediaType={row.mediaType}
				tmdbId={row.tmdbId}
				userMediaId={row.userMediaId}
				draft={draft}
				proposedSaga={null}
				currentSagaId={row.saga?.id ?? null}
				currentSagaNumber={row.sagaNumber}
				onChange={setDraft}
			/>
			{!check.isValid && <Callout tone="danger">{check.message}</Callout>}
		</Modal>
	);
}
