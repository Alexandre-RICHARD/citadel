import { SagaChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/sagaChoiceKind.enum";
import { mediaCustomizationSchema } from "@citadel/specs/src/projects/backlog/schema/mediaCustomizationSchema";
import { Plus } from "lucide-react";
import { useState } from "react";

import { checkInput } from "../../../../../../common/validation/checkInput";
import { backlogFieldLabels } from "../../../../api/backlogFieldLabels";
import { useCreateUserMedia } from "../../../../api/media/useCreateUserMedia";
import type { MediaPreviewFm } from "../../../../api/model/media/mediaPreviewFm.type";
import styles from "../../../../backlog.module.scss";
import { Callout } from "../../../../components/Callout";
import { Modal } from "../../../../components/Modal";
import type { MediaCustomizationDraft } from "../../../../helper/media/mediaCustomizationDraft.type";
import { ModalActions } from "../../../Homepage/components/ModalActions";
import { SectionTitle } from "../../../Homepage/components/SectionTitle";
import { MediaCustomizationFields } from "../MediaCustomizationFields";
import { MediaPreview } from "../MediaPreview";

type Props = {
	preview: MediaPreviewFm;
	onClose: () => void;
};

/**
 * La fiche TMDB, puis la personnalisation : l'affiche que TMDB met en avant, et la saga que propose la collection d'un
 * film. « Ajouter au backlog » ferme la modale tout de suite : la ligne apparaît en tête du tableau, grisée
 */
export function AddMediaForm({ preview, onClose }: Props) {
	const [draft, setDraft] = useState<MediaCustomizationDraft>({
		imagePath: preview.posterPath,
		saga:
			preview.proposedSaga === null
				? { kind: SagaChoiceKindEnum.NONE }
				: { kind: SagaChoiceKindEnum.PROPOSED },
		sagaNumber: null,
	});
	const createUserMedia = useCreateUserMedia(preview);
	const check = checkInput(mediaCustomizationSchema, draft, backlogFieldLabels);
	const isInBacklog = preview.userMediaId !== null;

	return (
		<Modal
			title="Ajouter au backlog"
			subtitle={preview.title}
			icon={Plus}
			size="lg"
			actions={
				<ModalActions
					validateLabel="Ajouter au backlog"
					canValidate={check.isValid && !isInBacklog}
					onCancel={onClose}
					onValidate={() => {
						if (check.isValid)
							createUserMedia.mutate({
								mediaType: preview.mediaType,
								tmdbId: preview.tmdbId,
								customization: check.data,
							});
						onClose();
					}}
				/>
			}
			onClose={onClose}
		>
			<div className={styles.formStack}>
				{isInBacklog && <Callout>Ce média est déjà dans le backlog.</Callout>}
				<MediaPreview preview={preview} />
				{!isInBacklog && (
					<section>
						<SectionTitle>Personnalisation</SectionTitle>
						<MediaCustomizationFields
							mediaType={preview.mediaType}
							tmdbId={preview.tmdbId}
							userMediaId={null}
							draft={draft}
							proposedSaga={preview.proposedSaga}
							currentSagaId={null}
							currentSagaNumber={null}
							onChange={setDraft}
						/>
					</section>
				)}
				{!check.isValid && check.message !== null && (
					<Callout tone="danger">{check.message}</Callout>
				)}
			</div>
		</Modal>
	);
}
