import { createUserGameBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/userGames/createUserGame/createUserGameBodySchema";
import { createUserVersionBodySchema } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/createUserVersion/createUserVersionBodySchema";
import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum";
import { SeriesChoiceKindEnum } from "@citadel/specs/src/projects/backlog/enum/seriesChoiceKind.enum";
import { convertStatus } from "@citadel/specs/src/projects/backlog/rule/status/convertStatus";
import { isFinishedStatus } from "@citadel/specs/src/projects/backlog/rule/status/isFinishedStatus";
import { CopyPlus, LibraryBig } from "lucide-react";
import { useState } from "react";

import { checkInput } from "../../../../../../common/validation/checkInput";
import { backlogFieldLabels } from "../../../../api/backlogFieldLabels";
import type { StoredGameFm } from "../../../../api/model/storedGameFm.type";
import { useCreateUserGame } from "../../../../api/userGame/useCreateUserGame";
import { useTakenVersionPlatforms } from "../../../../api/userGame/useTakenVersionPlatforms";
import { useCreateUserVersion } from "../../../../api/userVersion/useCreateUserVersion";
import styles from "../../../../backlog.module.scss";
import { Callout } from "../../../../components/Callout";
import { Modal } from "../../../../components/Modal";
import type { CustomizationDraft } from "../../../../helper/series/customizationDraft.type";
import { DEFAULT_USER_VERSION_DRAFT } from "../../defaultUserVersionDraft";
import type { UserVersionDraft } from "../../userVersionDraft.type";
import { FinishDateModal } from "../FinishDateModal";
import { ModalActions } from "../ModalActions";
import { SectionTitle } from "../SectionTitle";
import { UserGameFields } from "../UserGameFields";
import { UserVersionDraftFields } from "../UserVersionDraftFields";
import { VersionPlatformFields } from "../VersionPlatformFields";

type Props = {
	storedGame: StoredGameFm;
	versionId: number | null;
	imageIds: string[] | null;
	onClose: () => void;
};

/**
 * Ajout au backlog (cahier des charges, §8) : la personnalisation si le jeu n'y est pas encore, puis version, plateforme
 * et données du joueur. Pour un jeu déjà dans le backlog, « Ajouter une version jouée ». Au rang 5 ou plus sans date de
 * fin, la date est demandée avant l'envoi
 */
export function AddUserVersionForm({
	storedGame,
	versionId,
	imageIds,
	onClose,
}: Props) {
	const isNewToBacklog = storedGame.customization === null;
	const originalVersion = storedGame.versions.find(
		({ isOriginal }) => isOriginal,
	);
	const [customization, setCustomization] = useState<CustomizationDraft>(
		() => ({
			imageId: imageIds?.at(0) ?? originalVersion?.coverImageId ?? null,
			endingType: EndingTypeEnum.STORY,
			series: { kind: SeriesChoiceKindEnum.PROPOSED },
			seriesNumber: null,
		}),
	);
	const [draft, setDraft] = useState<UserVersionDraft>(() => ({
		...DEFAULT_USER_VERSION_DRAFT,
		versionId: storedGame.versions.some(({ id }) => id === versionId)
			? versionId
			: null,
	}));
	const [isAskingFinishDate, setIsAskingFinishDate] = useState(false);
	const takenVersionPlatforms = useTakenVersionPlatforms(storedGame.id);
	const createUserGame = useCreateUserGame(storedGame.id);
	const createUserVersion = useCreateUserVersion(storedGame.id);

	const endingType =
		storedGame.customization?.endingType ?? customization.endingType;
	const gameName = storedGame.frenchName ?? storedGame.name;
	const isTaken = takenVersionPlatforms.some(
		(taken) =>
			taken.versionId === draft.versionId &&
			taken.platformId === draft.platformId,
	);
	const { versionId: chosenVersionId, platformId: chosenPlatformId } = draft;
	const userVersion =
		chosenVersionId === null || chosenPlatformId === null
			? null
			: { ...draft, versionId: chosenVersionId, platformId: chosenPlatformId };
	const userGameCheck =
		userVersion === null
			? null
			: checkInput(
					createUserGameBodySchema,
					{ gameId: storedGame.id, customization, userVersion },
					backlogFieldLabels,
				);
	const userVersionCheck =
		userVersion === null
			? null
			: checkInput(
					createUserVersionBodySchema,
					userVersion,
					backlogFieldLabels,
				);
	const check = isNewToBacklog ? userGameCheck : userVersionCheck;

	function submit(finishDate: string | null) {
		if (isNewToBacklog && userGameCheck?.isValid === true)
			createUserGame.mutate({
				...userGameCheck.data,
				userVersion: { ...userGameCheck.data.userVersion, finishDate },
			});
		else if (!isNewToBacklog && userVersionCheck?.isValid === true)
			createUserVersion.mutate({ ...userVersionCheck.data, finishDate });
		onClose();
	}

	if (isAskingFinishDate)
		return (
			<FinishDateModal
				subtitle={gameName}
				onCancel={() => submit(null)}
				onValidate={submit}
			/>
		);

	return (
		<Modal
			title={
				isNewToBacklog ? "Ajouter au backlog" : "Ajouter une version jouée"
			}
			subtitle={gameName}
			icon={isNewToBacklog ? LibraryBig : CopyPlus}
			size="lg"
			actions={
				<ModalActions
					canValidate={check?.isValid === true && !isTaken}
					onCancel={onClose}
					onValidate={() => {
						if (isFinishedStatus(draft.status) && draft.finishDate === null)
							setIsAskingFinishDate(true);
						else submit(draft.finishDate);
					}}
				/>
			}
			onClose={onClose}
		>
			{isNewToBacklog && (
				<section className={styles.modalSection}>
					<SectionTitle>Personnalisation</SectionTitle>
					<UserGameFields
						gameId={storedGame.id}
						draft={customization}
						proposedSeries={storedGame.proposedSeries}
						currentSeriesId={null}
						currentSeriesNumber={null}
						onChange={(nextCustomization) => {
							setCustomization(nextCustomization);
							// Le statut choisi suit le type de fin (cahier des charges, §6)
							setDraft({
								...draft,
								status: convertStatus(
									draft.status,
									nextCustomization.endingType,
								),
							});
						}}
					/>
				</section>
			)}
			<section className={styles.modalSection}>
				<SectionTitle>Version jouée</SectionTitle>
				<div className={styles.formStack}>
					<Callout>
						Choisis la version jouée, puis la plateforme.
						{isNewToBacklog &&
							" Annuler laisse le jeu en base, hors du backlog."}
					</Callout>
					<VersionPlatformFields
						gameName={storedGame.name}
						versions={storedGame.versions}
						takenVersionPlatforms={takenVersionPlatforms}
						versionId={draft.versionId}
						platformId={draft.platformId}
						onChange={(nextVersionId, platformId) =>
							setDraft({ ...draft, versionId: nextVersionId, platformId })
						}
					/>
				</div>
			</section>
			<section className={styles.modalSection}>
				<SectionTitle>
					Mes données <span className={styles.optionalTag}>optionnel</span>
				</SectionTitle>
				<UserVersionDraftFields
					draft={draft}
					endingType={endingType}
					dlcs={storedGame.dlcs}
					onChange={setDraft}
				/>
				{check?.isValid === false && (
					<Callout tone="danger">{check.message}</Callout>
				)}
			</section>
		</Modal>
	);
}
